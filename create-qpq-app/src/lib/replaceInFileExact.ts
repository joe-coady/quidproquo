import fs from 'fs';

// Replace an exact string in one file, throwing if it isn't there. Targeted
// edits should fail loudly when the template drifts.
export const replaceInFileExact = (filePath: string, from: string, to: string): void => {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes(from)) {
    throw new Error(`Expected to find "${from}" in ${filePath}. Has the template changed?`);
  }
  fs.writeFileSync(filePath, original.split(from).join(to));
};
