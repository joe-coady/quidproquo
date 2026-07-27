import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { replaceInFileExact } from './replaceInFileExact';

describe('replaceInFileExact', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'cqa-exact-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('replaces the exact string', () => {
    const filePath = path.join(root, 'domain.ts');
    fs.writeFileSync(filePath, "export const domain = 'todo.quidproquojs.com';");

    replaceInFileExact(filePath, 'todo.quidproquojs.com', 'my.example.com');

    expect(fs.readFileSync(filePath, 'utf8')).toBe("export const domain = 'my.example.com';");
  });

  it('throws when the string is missing, so template drift fails loudly', () => {
    const filePath = path.join(root, 'domain.ts');
    fs.writeFileSync(filePath, 'export const domain = "changed";');

    expect(() => replaceInFileExact(filePath, 'todo.quidproquojs.com', 'my.example.com')).toThrow(/Has the template changed/);
  });
});
