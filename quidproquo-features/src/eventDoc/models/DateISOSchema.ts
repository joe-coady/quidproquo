import { getValidQpqIsoDateTime, QpqIsoDateTime } from 'quidproquo-core';

import { z } from 'zod';

// The zod validator for QpqIsoDateTime (the type itself lives in quidproquo-core;
// this package is the zod home).
export const DateISOSchema = z.custom<QpqIsoDateTime>(
  (val) => typeof val === 'string' && getValidQpqIsoDateTime(val) !== undefined,
  'Invalid DateISO'
);
