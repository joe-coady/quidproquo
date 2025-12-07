import { 
  KeyValueStoreQPQConfigSetting,
  KvsAdvancedDataType,
  KvsAttributePath,
  KvsLogicalOperator, 
  KvsLogicalOperatorType,
  KvsQueryCondition, 
  KvsQueryOperation, 
  KvsQueryOperationType,
  KvsUpdate,
  KvsUpdateActionType,
  QPQConfig,
  qpqCoreUtils,
  QpqPagedData} from 'quidproquo-core';

import * as fs from 'fs';
import * as path from 'path';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';

interface KvsItem {
  [key: string]: any;
}

interface QueryParams {
  sql: string;
  params: any[];
}

export class SqliteKvsRepository {
  private db: sqlite.Database<sqlite3.Database, sqlite3.Statement> | null = null;
  private dbPath: string;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private runtimePath: string, private qpqConfig: QPQConfig) {
    this.dbPath = path.join(runtimePath, 'kvs', 'database.db');
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize();
    await this.initPromise;
  }

  private async initialize(): Promise<void> {
    const kvsDir = path.dirname(this.dbPath);
    if (!fs.existsSync(kvsDir)) {
      fs.mkdirSync(kvsDir, { recursive: true });
    }

    this.db = await sqlite.open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.db.exec('PRAGMA journal_mode = WAL');
    await this.db.exec('PRAGMA synchronous = NORMAL');
    await this.db.exec('PRAGMA cache_size = 10000');
    await this.db.exec('PRAGMA temp_store = MEMORY');
    await this.db.exec('PRAGMA busy_timeout = 5000'); // Wait up to 5 seconds for locks

    this.initialized = true;
  }

  private getTableName(keyValueStoreName: string): string {
    const serviceName = qpqCoreUtils.getApplicationModuleName(this.qpqConfig);
    return `qpq_kvs_${serviceName}_${keyValueStoreName}`.replace(/-/g, '_');
  }

  private async ensureTable(keyValueStoreName: string): Promise<void> {
    await this.ensureInitialized();
    
    const tableName = this.getTableName(keyValueStoreName);
    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    
    if (!storeConfig) {
      throw new Error(`Key value store '${keyValueStoreName}' not found in configuration`);
    }

    const hasSortKey = storeConfig.sortKeys.length > 0;
    
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        pk TEXT NOT NULL,
        sk TEXT ${hasSortKey ? 'NOT NULL' : ''},
        data TEXT NOT NULL,
        ttl INTEGER,
        PRIMARY KEY (pk${hasSortKey ? ', sk' : ''})
      )
    `;

    await this.db!.exec(createTableSql);

    await this.db!.exec(`CREATE INDEX IF NOT EXISTS idx_${tableName}_pk ON ${tableName}(pk)`);
    
    if (hasSortKey) {
      await this.db!.exec(`CREATE INDEX IF NOT EXISTS idx_${tableName}_pk_sk ON ${tableName}(pk, sk)`);
    }

    for (const index of storeConfig.indexes) {
      const indexTableName = `${tableName}_gsi_${index.partitionKey.key}${index.sortKey ? '_' + index.sortKey.key : ''}`;
      
      const createIndexTableSql = `
        CREATE TABLE IF NOT EXISTS ${indexTableName} (
          gsi_pk TEXT NOT NULL,
          gsi_sk TEXT ${index.sortKey ? 'NOT NULL' : ''},
          pk TEXT NOT NULL,
          sk TEXT,
          PRIMARY KEY (gsi_pk${index.sortKey ? ', gsi_sk' : ''}, pk${hasSortKey ? ', sk' : ''})
        )
      `;
      
      await this.db!.exec(createIndexTableSql);
      await this.db!.exec(`CREATE INDEX IF NOT EXISTS idx_${indexTableName}_gsi ON ${indexTableName}(gsi_pk${index.sortKey ? ', gsi_sk' : ''})`);
    }
  }

  private extractKeyValue(item: any, keyConfig: { key: string; type: string }): any {
    const value = item[keyConfig.key];
    if (value === undefined || value === null) {
      return null;
    }
    
    if (keyConfig.type === 'number') {
      return String(value);
    }
    
    return value;
  }

  private buildKeyFromItem(item: any, storeConfig: KeyValueStoreQPQConfigSetting): { pk: string; sk: string | null } {
    const pk = this.extractKeyValue(item, storeConfig.partitionKey);
    const sk = storeConfig.sortKeys.length > 0 
      ? this.extractKeyValue(item, storeConfig.sortKeys[0])
      : null;
    
    return { pk, sk };
  }

  private buildKeyFromKeyString(key: string, storeConfig: KeyValueStoreQPQConfigSetting): { pk: string; sk: string | null } {
    const hasSortKey = storeConfig.sortKeys.length > 0;
    
    if (!hasSortKey) {
      return { pk: key, sk: null };
    }
    
    const [pk, ...skParts] = key.split('#');
    return { pk, sk: skParts.join('#') || null };
  }

  private buildWhereClause(operation: KvsQueryOperation, paramIndex: { value: number }): QueryParams {
    if ('operation' in operation && operation.operation in KvsLogicalOperatorType) {
      const logicalOp = operation as KvsLogicalOperator;
      const conditions = logicalOp.conditions.map(cond => 
        this.buildWhereClause(cond, paramIndex)
      );
      
      const sqlParts = conditions.map(c => `(${c.sql})`);
      const allParams = conditions.flatMap(c => c.params);
      
      const operator = logicalOp.operation === KvsLogicalOperatorType.And ? ' AND ' : ' OR ';
      
      return {
        sql: sqlParts.join(operator),
        params: allParams
      };
    }

    const condition = operation as KvsQueryCondition;
    const columnName = condition.key === 'pk' || condition.key === 'sk' 
      ? condition.key 
      : `json_extract(data, '$.${condition.key}')`;

    switch (condition.operation) {
      case KvsQueryOperationType.Equal:
        paramIndex.value++;
        return {
          sql: `${columnName} = ?`,
          params: [condition.valueA]
        };
        
      case KvsQueryOperationType.NotEqual:
        paramIndex.value++;
        return {
          sql: `${columnName} != ?`,
          params: [condition.valueA]
        };
        
      case KvsQueryOperationType.LessThan:
        paramIndex.value++;
        return {
          sql: `${columnName} < ?`,
          params: [condition.valueA]
        };
        
      case KvsQueryOperationType.LessThanOrEqual:
        paramIndex.value++;
        return {
          sql: `${columnName} <= ?`,
          params: [condition.valueA]
        };
        
      case KvsQueryOperationType.GreaterThan:
        paramIndex.value++;
        return {
          sql: `${columnName} > ?`,
          params: [condition.valueA]
        };
        
      case KvsQueryOperationType.GreaterThanOrEqual:
        paramIndex.value++;
        return {
          sql: `${columnName} >= ?`,
          params: [condition.valueA]
        };
        
      case KvsQueryOperationType.Between:
        paramIndex.value += 2;
        return {
          sql: `${columnName} BETWEEN ? AND ?`,
          params: [condition.valueA, condition.valueB]
        };
        
      case KvsQueryOperationType.BeginsWith:
        paramIndex.value++;
        return {
          sql: `${columnName} LIKE ?`,
          params: [`${condition.valueA}%`]
        };
        
      case KvsQueryOperationType.Contains:
        paramIndex.value++;
        return {
          sql: `${columnName} LIKE ?`,
          params: [`%${condition.valueA}%`]
        };
        
      case KvsQueryOperationType.NotContains:
        paramIndex.value++;
        return {
          sql: `${columnName} NOT LIKE ?`,
          params: [`%${condition.valueA}%`]
        };
        
      case KvsQueryOperationType.In: {
        const inValues = condition.valueA as any[];
        const placeholders = inValues.map(() => '?').join(', ');
        paramIndex.value += inValues.length;
        return {
          sql: `${columnName} IN (${placeholders})`,
          params: inValues
        };
      }
        
      case KvsQueryOperationType.Exists:
        return {
          sql: `${columnName} IS NOT NULL`,
          params: []
        };
        
      case KvsQueryOperationType.NotExists:
        return {
          sql: `${columnName} IS NULL`,
          params: []
        };
        
      default:
        throw new Error(`Unsupported query operation: ${condition.operation}`);
    }
  }

  private applyUpdateToItem(item: any, updates: KvsUpdate): any {
    const updatedItem = { ...item };

    for (const update of updates) {
      const pathArray = this.getPathArray(update.attributePath);

      switch (update.action) {
        case KvsUpdateActionType.Set:
          this.setNestedValue(updatedItem, pathArray, update.value);
          break;

        case KvsUpdateActionType.Remove:
          this.removeNestedValue(updatedItem, pathArray);
          break;

        case KvsUpdateActionType.Add: {
          const currentValue = this.getNestedValue(updatedItem, pathArray);
          if (typeof currentValue === 'number' && typeof update.value === 'number') {
            this.setNestedValue(updatedItem, pathArray, currentValue + update.value);
          } else if (Array.isArray(currentValue) && Array.isArray(update.value)) {
            this.setNestedValue(updatedItem, pathArray, [...new Set([...currentValue, ...update.value])]);
          } else if (currentValue === undefined && typeof update.value === 'number') {
            this.setNestedValue(updatedItem, pathArray, update.value);
          }
          break;
        }

        case KvsUpdateActionType.Delete: {
          const existing = this.getNestedValue(updatedItem, pathArray);
          if (Array.isArray(existing) && Array.isArray(update.value)) {
            const filtered = existing.filter(item => !(update.value as any[]).includes(item));
            this.setNestedValue(updatedItem, pathArray, filtered);
          }
          break;
        }

        case KvsUpdateActionType.SetIfNotExists: {
          const currentValue = this.getNestedValue(updatedItem, pathArray);
          if (currentValue === undefined || currentValue === null) {
            this.setNestedValue(updatedItem, pathArray, update.value);
          }
          break;
        }

        case KvsUpdateActionType.Increment: {
          const currentValue = this.getNestedValue(updatedItem, pathArray);
          const baseValue = (currentValue === undefined || currentValue === null)
            ? (update.defaultValue as number)
            : currentValue;
          this.setNestedValue(updatedItem, pathArray, baseValue + (update.value as number));
          break;
        }
      }
    }

    return updatedItem;
  }

  private getPathArray(path: KvsAttributePath): string[] {
    if (typeof path === 'string') {
      return path.split('.');
    }
    return path.map((p: string | number) => String(p));
  }

  private getNestedValue(obj: any, path: string[]): any {
    return path.reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  private setNestedValue(obj: any, path: string[], value: any): void {
    const lastKey = path[path.length - 1];
    const parentPath = path.slice(0, -1);
    
    const parent = parentPath.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    parent[lastKey] = value;
  }

  private removeNestedValue(obj: any, path: string[]): void {
    const lastKey = path[path.length - 1];
    const parentPath = path.slice(0, -1);
    
    const parent = this.getNestedValue(obj, parentPath);
    if (parent) {
      delete parent[lastKey];
    }
  }

  private async updateIndexes(
    keyValueStoreName: string,
    oldItem: any | null,
    newItem: any | null,
    pk: string,
    sk: string | null
  ): Promise<void> {
    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    if (!storeConfig || storeConfig.indexes.length === 0) {
      return;
    }

    const tableName = this.getTableName(keyValueStoreName);
    
    for (const index of storeConfig.indexes) {
      const indexTableName = `${tableName}_gsi_${index.partitionKey.key}${index.sortKey ? '_' + index.sortKey.key : ''}`;
      
      if (oldItem) {
        const oldGsiPk = this.extractKeyValue(oldItem, index.partitionKey);
        const oldGsiSk = index.sortKey ? this.extractKeyValue(oldItem, index.sortKey) : null;
        
        if (oldGsiPk !== null) {
          const deleteSql = index.sortKey
            ? `DELETE FROM ${indexTableName} WHERE gsi_pk = ? AND gsi_sk = ? AND pk = ? AND sk = ?`
            : `DELETE FROM ${indexTableName} WHERE gsi_pk = ? AND pk = ? AND sk ${sk === null ? 'IS NULL' : '= ?'}`;
          
          const deleteParams = index.sortKey
            ? [oldGsiPk, oldGsiSk, pk, sk]
            : sk === null
              ? [oldGsiPk, pk]
              : [oldGsiPk, pk, sk];
          
          await this.db!.run(deleteSql, deleteParams);
        }
      }
      
      if (newItem) {
        const newGsiPk = this.extractKeyValue(newItem, index.partitionKey);
        const newGsiSk = index.sortKey ? this.extractKeyValue(newItem, index.sortKey) : null;
        
        if (newGsiPk !== null) {
          const insertSql = index.sortKey
            ? `INSERT INTO ${indexTableName} (gsi_pk, gsi_sk, pk, sk) VALUES (?, ?, ?, ?)`
            : `INSERT INTO ${indexTableName} (gsi_pk, pk, sk) VALUES (?, ?, ?)`;
          
          const insertParams = index.sortKey
            ? [newGsiPk, newGsiSk, pk, sk]
            : [newGsiPk, pk, sk];
          
          await this.db!.run(insertSql, insertParams);
        }
      }
    }
  }

  async get(keyValueStoreName: string, key: string): Promise<any | null> {
    await this.ensureTable(keyValueStoreName);
    
    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      throw new Error(`Key value store '${keyValueStoreName}' not found`);
    }
    
    const { pk, sk } = this.buildKeyFromKeyString(key, storeConfig);
    const tableName = this.getTableName(keyValueStoreName);
    
    const sql = sk !== null
      ? `SELECT data FROM ${tableName} WHERE pk = ? AND sk = ?`
      : `SELECT data FROM ${tableName} WHERE pk = ?`;
    
    const params = sk !== null ? [pk, sk] : [pk];
    
    const row = await this.db!.get(sql, params);
    
    return row ? JSON.parse(row.data) : null;
  }

  async query(
    keyValueStoreName: string,
    keyCondition: KvsQueryOperation,
    filter?: KvsQueryOperation,
    nextPageKey?: string,
    indexName?: string,
    limit?: number,
    sortAscending: boolean = true
  ): Promise<QpqPagedData<any>> {
    await this.ensureTable(keyValueStoreName);
    
    const tableName = this.getTableName(keyValueStoreName);
    const paramIndex = { value: 0 };
    
    const keyClause = this.buildWhereClause(keyCondition, paramIndex);
    const filterClause = filter ? this.buildWhereClause(filter, paramIndex) : null;
    
    let sql = `SELECT pk, sk, data FROM ${tableName} WHERE ${keyClause.sql}`;
    let params = [...keyClause.params];
    
    if (filterClause) {
      sql += ` AND ${filterClause.sql}`;
      params.push(...filterClause.params);
    }
    
    if (nextPageKey) {
      const lastKey = JSON.parse(Buffer.from(nextPageKey, 'base64').toString());
      sql += ` AND (pk > ? OR (pk = ? AND sk > ?))`;
      params.push(lastKey.pk, lastKey.pk, lastKey.sk || '');
    }
    
    sql += ` ORDER BY pk ${sortAscending ? 'ASC' : 'DESC'}`;
    
    if (sortAscending !== undefined) {
      sql += `, sk ${sortAscending ? 'ASC' : 'DESC'}`;
    }
    
    const queryLimit = (limit || 100) + 1;
    sql += ` LIMIT ${queryLimit}`;
    
    const rows = await this.db!.all(sql, params);
    
    const hasMore = rows.length === queryLimit;
    const items = rows.slice(0, limit || 100).map(row => JSON.parse(row.data));
    
    let newNextPageKey: string | undefined;
    if (hasMore && rows.length > 0) {
      const lastRow = rows[rows.length - 2];
      const lastKey = { pk: lastRow.pk, sk: lastRow.sk };
      newNextPageKey = Buffer.from(JSON.stringify(lastKey)).toString('base64');
    }
    
    return {
      items,
      nextPageKey: newNextPageKey
    };
  }

  async scan(
    keyValueStoreName: string,
    filter?: KvsQueryOperation,
    nextPageKey?: string,
    limit?: number
  ): Promise<QpqPagedData<any>> {
    await this.ensureTable(keyValueStoreName);
    
    const tableName = this.getTableName(keyValueStoreName);
    const paramIndex = { value: 0 };
    
    let sql = `SELECT pk, sk, data FROM ${tableName}`;
    let params: any[] = [];
    
    if (filter) {
      const filterClause = this.buildWhereClause(filter, paramIndex);
      sql += ` WHERE ${filterClause.sql}`;
      params = filterClause.params;
    }
    
    if (nextPageKey) {
      const lastKey = JSON.parse(Buffer.from(nextPageKey, 'base64').toString());
      const wherePrefix = filter ? ' AND' : ' WHERE';
      sql += `${wherePrefix} (pk > ? OR (pk = ? AND sk > ?))`;
      params.push(lastKey.pk, lastKey.pk, lastKey.sk || '');
    }
    
    sql += ' ORDER BY pk ASC, sk ASC';
    
    const queryLimit = (limit || 100) + 1;
    sql += ` LIMIT ${queryLimit}`;
    
    const rows = await this.db!.all(sql, params);
    
    const hasMore = rows.length === queryLimit;
    const items = rows.slice(0, limit || 100).map(row => JSON.parse(row.data));
    
    let newNextPageKey: string | undefined;
    if (hasMore && rows.length > 0) {
      const lastRow = rows[rows.length - 2];
      const lastKey = { pk: lastRow.pk, sk: lastRow.sk };
      newNextPageKey = Buffer.from(JSON.stringify(lastKey)).toString('base64');
    }
    
    return {
      items,
      nextPageKey: newNextPageKey
    };
  }

  async upsert(keyValueStoreName: string, item: any): Promise<any> {
    await this.ensureTable(keyValueStoreName);
    
    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      throw new Error(`Key value store '${keyValueStoreName}' not found`);
    }
    
    const { pk, sk } = this.buildKeyFromItem(item, storeConfig);
    const tableName = this.getTableName(keyValueStoreName);
    
    // Get existing item for index updates
    const existingSql = sk !== null
      ? `SELECT data FROM ${tableName} WHERE pk = ? AND sk = ?`
      : `SELECT data FROM ${tableName} WHERE pk = ?`;
    
    const existingParams = sk !== null ? [pk, sk] : [pk];
    const existingRow = await this.db!.get(existingSql, existingParams);
    const oldItem = existingRow ? JSON.parse(existingRow.data) : null;
    
    // Upsert the item - SQLite will handle locking automatically
    const sql = sk !== null
      ? `INSERT OR REPLACE INTO ${tableName} (pk, sk, data) VALUES (?, ?, ?)`
      : `INSERT OR REPLACE INTO ${tableName} (pk, data) VALUES (?, ?)`;
    
    const params = sk !== null
      ? [pk, sk, JSON.stringify(item)]
      : [pk, JSON.stringify(item)];
    
    await this.db!.run(sql, params);
    
    // Update indexes
    await this.updateIndexes(keyValueStoreName, oldItem, item, pk, sk);
    
    return item;
  }

  async update(
    keyValueStoreName: string,
    key: string,
    sortKey: string | undefined,
    updates: KvsUpdate
  ): Promise<any> {
    await this.ensureTable(keyValueStoreName);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      throw new Error(`Key value store '${keyValueStoreName}' not found`);
    }

    const tableName = this.getTableName(keyValueStoreName);
    const hasSortKey = storeConfig.sortKeys.length > 0;

    // Get current item
    const selectSql = hasSortKey && sortKey !== undefined
      ? `SELECT data FROM ${tableName} WHERE pk = ? AND sk = ?`
      : `SELECT data FROM ${tableName} WHERE pk = ?`;

    const selectParams = hasSortKey && sortKey !== undefined ? [key, sortKey] : [key];

    const row = await this.db!.get(selectSql, selectParams);

    // If item doesn't exist, create a base item with just the keys (like DynamoDB UpdateItem)
    const currentItem = row
      ? JSON.parse(row.data)
      : {
          [storeConfig.partitionKey.key]: key,
          ...(hasSortKey && sortKey !== undefined ? { [storeConfig.sortKeys[0].key]: sortKey } : {}),
        };

    const updatedItem = this.applyUpdateToItem(currentItem, updates);

    if (row) {
      // Update existing item
      const updateSql = hasSortKey && sortKey !== undefined
        ? `UPDATE ${tableName} SET data = ? WHERE pk = ? AND sk = ?`
        : `UPDATE ${tableName} SET data = ? WHERE pk = ?`;

      const updateParams = hasSortKey && sortKey !== undefined
        ? [JSON.stringify(updatedItem), key, sortKey]
        : [JSON.stringify(updatedItem), key];

      await this.db!.run(updateSql, updateParams);
    } else {
      // Insert new item
      const insertSql = hasSortKey && sortKey !== undefined
        ? `INSERT INTO ${tableName} (pk, sk, data) VALUES (?, ?, ?)`
        : `INSERT INTO ${tableName} (pk, data) VALUES (?, ?)`;

      const insertParams = hasSortKey && sortKey !== undefined
        ? [key, sortKey, JSON.stringify(updatedItem)]
        : [key, JSON.stringify(updatedItem)];

      await this.db!.run(insertSql, insertParams);
    }

    // Update indexes
    await this.updateIndexes(keyValueStoreName, row ? JSON.parse(row.data) : null, updatedItem, key, sortKey || null);

    return updatedItem;
  }

  async delete(keyValueStoreName: string, key: string): Promise<boolean> {
    await this.ensureTable(keyValueStoreName);
    
    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(this.qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      throw new Error(`Key value store '${keyValueStoreName}' not found`);
    }
    
    const { pk, sk } = this.buildKeyFromKeyString(key, storeConfig);
    const tableName = this.getTableName(keyValueStoreName);
    
    // Get item for index cleanup
    const selectSql = sk !== null
      ? `SELECT data FROM ${tableName} WHERE pk = ? AND sk = ?`
      : `SELECT data FROM ${tableName} WHERE pk = ?`;
    
    const selectParams = sk !== null ? [pk, sk] : [pk];
    const row = await this.db!.get(selectSql, selectParams);
    
    if (!row) {
      return false;
    }
    
    const oldItem = JSON.parse(row.data);
    
    // Delete the item - SQLite will handle locking automatically
    const deleteSql = sk !== null
      ? `DELETE FROM ${tableName} WHERE pk = ? AND sk = ?`
      : `DELETE FROM ${tableName} WHERE pk = ?`;
    
    const deleteParams = sk !== null ? [pk, sk] : [pk];
    
    const result = await this.db!.run(deleteSql, deleteParams);
    
    // Update indexes
    await this.updateIndexes(keyValueStoreName, oldItem, null, pk, sk);
    
    return result.changes! > 0;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}