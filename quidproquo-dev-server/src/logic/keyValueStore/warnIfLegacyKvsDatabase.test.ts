import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { warnIfLegacyKvsDatabase } from './warnIfLegacyKvsDatabase';

describe('warnIfLegacyKvsDatabase', () => {
  let runtimePath: string;

  beforeEach(() => {
    runtimePath = fs.mkdtempSync(path.join(os.tmpdir(), 'qpq-kvs-legacy-'));
  });

  afterEach(() => {
    fs.rmSync(runtimePath, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('warns with the file path when a legacy database.db exists', () => {
    fs.mkdirSync(path.join(runtimePath, 'kvs'), { recursive: true });
    fs.writeFileSync(path.join(runtimePath, 'kvs', 'database.db'), '');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnIfLegacyKvsDatabase(runtimePath);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(path.join(runtimePath, 'kvs', 'database.db'));
  });

  it('does nothing when there is no legacy database.db', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    warnIfLegacyKvsDatabase(runtimePath);

    expect(warn).not.toHaveBeenCalled();
  });
});
