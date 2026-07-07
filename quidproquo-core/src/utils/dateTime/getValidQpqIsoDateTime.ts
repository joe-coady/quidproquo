import { QpqIsoDateTime } from '../../types/QpqIsoDateTime';

const qpqIsoDateTimeRegex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d{3}Z$/;

export const getValidQpqIsoDateTime = (value: string | undefined): QpqIsoDateTime | undefined =>
  value && qpqIsoDateTimeRegex.test(value) ? (value as QpqIsoDateTime) : undefined;
