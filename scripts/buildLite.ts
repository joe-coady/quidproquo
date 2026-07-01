import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  name: string;
  workspaces?: string[];
  scripts?: Record<string, string>;
}

const repoRoot = path.join(__dirname, '..');

const readPackageJson = (dir: string): PackageJson =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as PackageJson;

// The `workspaces` array is the canonical build order (topologically sorted:
// core first, dependents after), matching what `npm run build --ws` uses.
const getOrderedWorkspaces = (): string[] => readPackageJson(repoRoot).workspaces || [];

// Every path git reports maps to at most one top-level workspace dir.
const getChangedWorkspaces = (workspaces: string[]): string[] => {
  const changed = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.slice(3).trim()) // strip the 2-char status + space
    .filter(Boolean)
    // A rename shows as "old -> new"; the new path is what matters.
    .map((file) => (file.includes(' -> ') ? file.split(' -> ')[1] : file))
    .map((file) => file.split('/')[0]);

  const changedSet = new Set(changed);

  // Keep workspace order, drop dupes and workspaces with no build script.
  return workspaces.filter((workspace) => {
    if (!changedSet.has(workspace)) {
      return false;
    }

    const pkg = readPackageJson(path.join(repoRoot, workspace));
    return Boolean(pkg.scripts?.build);
  });
};

const main = () => {
  const workspaces = getOrderedWorkspaces();
  const toBuild = getChangedWorkspaces(workspaces);

  if (toBuild.length === 0) {
    console.log('build:lite - no changed workspaces with a build script, nothing to build.');
    return;
  }

  console.log(`build:lite - building ${toBuild.length} changed workspace(s):`);
  toBuild.forEach((workspace) => console.log(`  - ${workspace}`));

  for (const workspace of toBuild) {
    console.log(`\n> building ${workspace}`);
    execSync(`npm run build -w ${workspace}`, { cwd: repoRoot, stdio: 'inherit' });
  }
};

main();
