/**
 * The KvsQueryOperationType enum represents possible operations
 * for a key-value store query.
 * Each operation is annotated with its corresponding DynamoDB condition.
 */
export enum KvsQueryOperationType {
  /** Corresponds to the DynamoDB 'EQ' condition. */
  Equal = 'Equal',

  /** Corresponds to the DynamoDB 'NE' condition. */
  NotEqual = 'NotEqual',

  /** Corresponds to the DynamoDB 'LT' condition. */
  LessThan = 'LessThan',

  /** Corresponds to the DynamoDB 'LE' condition. */
  LessThanOrEqual = 'LessThanOrEqual',

  /** Corresponds to the DynamoDB 'GT' condition. */
  GreaterThan = 'GreaterThan',

  /** Corresponds to the DynamoDB 'GE' condition. */
  GreaterThanOrEqual = 'GreaterThanOrEqual',

  /** Corresponds to the DynamoDB 'BETWEEN' condition. */
  Between = 'Between',

  /** Corresponds to the DynamoDB 'IN' condition. */
  In = 'In',

  /** Corresponds to the DynamoDB 'AttributeExists' condition. */
  Exists = 'Exists',

  /** Corresponds to the DynamoDB 'AttributeNotExists' condition. */
  NotExists = 'NotExists',

  /** Corresponds to the DynamoDB 'BEGINS_WITH' condition. */
  BeginsWith = 'BeginsWith',

  /** Corresponds to the DynamoDB 'CONTAINS' condition. */
  Contains = 'Contains',

  /** Corresponds to the DynamoDB 'NOT_CONTAINS' condition. */
  NotContains = 'NotContains',
}

/**
 * Enum representing the logical operators for a key-value store query.
 */
export enum KvsLogicalOperatorType {
  /**
   * Represents the logical AND operator.
   */
  And = 'And',

  /**
   * Represents the logical OR operator.
   */
  Or = 'Or',
}
