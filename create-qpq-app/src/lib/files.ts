import fs from 'fs';
import path from 'path';

// Extensions the rename sweeps are allowed to touch — everything else
// (images, favicons, fonts) passes through untouched.
const TEXT_FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.css', '.md', '.yml', '.yaml']);

// Depth-first list of every file under root (root must exist).
export const listFilesRecursive = (root: string): string[] => {
  const files: string[] = [];

  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  };

  walk(root);
  return files;
};

// Apply literal (non-regex) string replacements to every text file under
// root. Replacement tokens are chosen to be collision-free ('@todo/',
// 'apps/todo/'), so this is a mechanical sweep, not a heuristic one.
export const replaceInFiles = (root: string, replacements: Array<[from: string, to: string]>): void => {
  for (const filePath of listFilesRecursive(root)) {
    if (!TEXT_FILE_EXTENSIONS.has(path.extname(filePath))) {
      continue;
    }

    const original = fs.readFileSync(filePath, 'utf8');
    let updated = original;
    for (const [from, to] of replacements) {
      updated = updated.split(from).join(to);
    }

    if (updated !== original) {
      fs.writeFileSync(filePath, updated);
    }
  }
};

// Replace an exact string in one file, throwing if it isn't there — targeted
// edits should fail loudly when the template drifts.
export const replaceInFileExact = (filePath: string, from: string, to: string): void => {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes(from)) {
    throw new Error(`Expected to find "${from}" in ${filePath} — has the template changed?`);
  }
  fs.writeFileSync(filePath, original.split(from).join(to));
};

export const readJsonFile = <T = any>(filePath: string): T => JSON.parse(fs.readFileSync(filePath, 'utf8'));

export const writeJsonFile = (filePath: string, value: unknown): void => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};
