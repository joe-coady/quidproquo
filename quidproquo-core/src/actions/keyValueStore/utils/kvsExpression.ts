import { KvsQueryOperation, KvsQueryOperationType } from '../types';

const kvsExpression = (
  key: string,
  operation: KvsQueryOperationType,
  valueA?: KvsQueryOperation['valueA'],
  valueB?: KvsQueryOperation['valueB'],
): KvsQueryOperation => ({
  key: key,
  operation: operation,
  valueA: valueA,
  valueB: valueB,
});

export const kvsEqual = (key: string, value: KvsQueryOperation['valueA']): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.Equal, value);

export const kvsNotEqual = (key: string, value: KvsQueryOperation['valueA']): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.NotEqual, value);

export const kvsLessThan = (key: string, value: KvsQueryOperation['valueA']): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.LessThan, value);

export const kvsLessThanOrEqual = (
  key: string,
  value: KvsQueryOperation['valueA'],
): KvsQueryOperation => kvsExpression(key, KvsQueryOperationType.LessThanOrEqual, value);

export const kvsGreaterThan = (
  key: string,
  value: KvsQueryOperation['valueA'],
): KvsQueryOperation => kvsExpression(key, KvsQueryOperationType.GreaterThan, value);

export const kvsGreaterThanOrEqual = (
  key: string,
  value: KvsQueryOperation['valueA'],
): KvsQueryOperation => kvsExpression(key, KvsQueryOperationType.GreaterThanOrEqual, value);

export const kvsBetween = (
  key: string,
  valueA: KvsQueryOperation['valueA'],
  valueB: KvsQueryOperation['valueB'],
): KvsQueryOperation => kvsExpression(key, KvsQueryOperationType.Between, valueA, valueB);

export const kvsIn = (key: string, value: KvsQueryOperation['valueA']): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.In, value);

export const kvsExists = (key: string): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.Exists);

export const kvsNotExists = (key: string): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.NotExists);

export const kvsBeginsWith = (key: string, value: KvsQueryOperation['valueA']): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.BeginsWith, value);

export const kvsContains = (key: string, value: KvsQueryOperation['valueA']): KvsQueryOperation =>
  kvsExpression(key, KvsQueryOperationType.Contains, value);

export const kvsNotContains = (
  key: string,
  value: KvsQueryOperation['valueA'],
): KvsQueryOperation => kvsExpression(key, KvsQueryOperationType.NotContains, value);
