import {
  KvsAdvancedDataType,
  KvsCoreDataType,
  KvsLogicalOperator,
  KvsQueryCondition,
  KvsQueryOperation,
  KvsQueryOperationType,
} from '../../actions/keyValueStore/types';
import { InvalidScopeError, InvalidScopeErrorCode } from './InvalidScopeError';
import { composeScopedKvsValue, stripScopedKvsValue, validateRawPkValueForScopeOrThrow } from './scopedKvsValue';

// Operations whose comparison values can be safely prefixed with the scope:
// prefixing preserves equality and lexicographic ordering within one scope.
const SCOPABLE_PK_OPERATIONS = [
  KvsQueryOperationType.Equal,
  KvsQueryOperationType.BeginsWith,
  KvsQueryOperationType.LessThan,
  KvsQueryOperationType.LessThanOrEqual,
  KvsQueryOperationType.GreaterThan,
  KvsQueryOperationType.GreaterThanOrEqual,
  KvsQueryOperationType.Between,
  KvsQueryOperationType.In,
];

const composeScopedConditionValue = (scope: string, value: KvsAdvancedDataType | undefined): KvsAdvancedDataType | undefined => {
  if (value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => composeScopedKvsValue(scope, entry as KvsCoreDataType) as KvsCoreDataType);
  }

  return composeScopedKvsValue(scope, value as KvsCoreDataType);
};

/**
 * Rewrite every partition-key condition in a query operation tree so its
 * comparison values carry the scope prefix, matching how scoped items are
 * stored. `pkKeyNames` lists the condition keys that mean "the partition key"
 * on the calling backend (e.g. the configured attribute name, plus the 'pk'
 * alias on backends that support it).
 *
 * Returns the rewritten tree and how many partition-key conditions were
 * rewritten - a caller enforcing scope on a key condition should reject zero
 * (the query would silently span every scope).
 */
export function composeScopedKvsQueryOperation(
  scope: string,
  operation: KvsQueryOperation,
  pkKeyNames: string[],
): { operation: KvsQueryOperation; scopedConditionCount: number } {
  if ('conditions' in operation) {
    const logicalOperator = operation as KvsLogicalOperator;

    let scopedConditionCount = 0;
    const conditions = logicalOperator.conditions.map((child) => {
      const result = composeScopedKvsQueryOperation(scope, child, pkKeyNames);
      scopedConditionCount += result.scopedConditionCount;
      return result.operation;
    });

    return { operation: { ...logicalOperator, conditions }, scopedConditionCount };
  }

  const condition = operation as KvsQueryCondition;

  if (!pkKeyNames.includes(condition.key)) {
    return { operation: condition, scopedConditionCount: 0 };
  }

  if (!SCOPABLE_PK_OPERATIONS.includes(condition.operation)) {
    throw new InvalidScopeError(InvalidScopeErrorCode.unsafeCharacters, `Operation '${condition.operation}' on the partition key cannot be scoped.`);
  }

  return {
    operation: {
      ...condition,
      valueA: composeScopedConditionValue(scope, condition.valueA),
      valueB: composeScopedConditionValue(scope, condition.valueB) as KvsQueryCondition['valueB'],
    },
    scopedConditionCount: 1,
  };
}

/**
 * Compose a scoped KEY condition in one walk, throwing when the tree never
 * constrains the partition key - a scoped query that constrains no pk would
 * silently span every scope.
 */
export function composeScopedKvsQueryOperationOrThrow(scope: string, operation: KvsQueryOperation, pkKeyNames: string[]): KvsQueryOperation {
  const { operation: composed, scopedConditionCount } = composeScopedKvsQueryOperation(scope, operation, pkKeyNames);

  if (scopedConditionCount === 0) {
    throw new InvalidScopeError(
      InvalidScopeErrorCode.queryMissingPartitionKey,
      'A scoped query must constrain the partition key in its key condition.',
    );
  }

  return composed;
}

/**
 * Assert a scoped query is expressible on EVERY backend. Validation only - the
 * conditions are not modified.
 *
 * On value-composed backends (dynamo) the scope lives inside the pk values of
 * one shared table, so a scoped query must constrain the pk (those conditions
 * get rewritten to the composed form) and may only use scope-rewritable
 * operators. Backends with physical partitioning (the dev-server's per-scope
 * json files) don't need this to be SAFE - they run it anyway so a query that
 * would fail deployed fails locally first.
 */
export function validateScopedQueryConstrainsPkOrThrow(scope: string, operation: KvsQueryOperation, pkKeyNames: string[]): void {
  composeScopedKvsQueryOperationOrThrow(scope, operation, pkKeyNames);
}

// One comparison value (or each entry of an In list) checked for the reserved
// delimiter; non-string values pass through untouched.
const validateUnscopedConditionValueOrThrow = (value: KvsAdvancedDataType | undefined): void => {
  if (Array.isArray(value)) {
    value.forEach((entry) => validateRawPkValueForScopeOrThrow(entry as KvsCoreDataType));
    return;
  }

  if (value !== undefined) {
    validateRawPkValueForScopeOrThrow(value as KvsCoreDataType);
  }
};

/**
 * The reserved delimiter is rejected in UNSCOPED partition-key comparisons too:
 * on a value-composed backend a raw value like 'acme::secret' in a pk condition
 * would match (or probe for) scope acme's composed rows. Validation only - the
 * tree is not modified.
 */
export function validateUnscopedPkConditionValuesOrThrow(operation: KvsQueryOperation, pkKeyNames: string[]): void {
  if ('conditions' in operation) {
    (operation as KvsLogicalOperator).conditions.forEach((child) => validateUnscopedPkConditionValuesOrThrow(child, pkKeyNames));
    return;
  }

  const condition = operation as KvsQueryCondition;

  if (!pkKeyNames.includes(condition.key)) {
    return;
  }

  validateUnscopedConditionValueOrThrow(condition.valueA);
  validateUnscopedConditionValueOrThrow(condition.valueB);
}

// Shallow-clone an item read from storage, stripping the scope prefix off its
// partition key attribute so callers never see the composed form.
export function stripScopedKvsItem<T extends Record<string, any>>(scope: string, item: T, pkAttributeName: string): T {
  const storedValue = item[pkAttributeName];
  const strippedValue = stripScopedKvsValue(scope, storedValue);

  return strippedValue === storedValue ? item : { ...item, [pkAttributeName]: strippedValue };
}
