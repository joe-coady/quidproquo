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
// core first, dependents after), matching what `npm run <script> --ws` uses.
const getOrderedWorkspaces = (): string[] => readPackageJson(repoRoot).workspaces || [];

// Every path git reports maps to at most one top-level workspace dir.
const getChangedWorkspaces = (workspaces: string[], script: string): string[] => {
  const changed = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.slice(3).trim()) // strip the 2-char status + space
    .filter(Boolean)
    // A rename shows as "old -> new"; the new path is what matters.
    .map((file) => (file.includes(' -> ') ? file.split(' -> ')[1] : file))
    .map((file) => file.split('/')[0]);

  const changedSet = new Set(changed);

  // Keep workspace order, drop dupes and workspaces without the script.
  return workspaces.filter((workspace) => {
    if (!changedSet.has(workspace)) {
      return false;
    }

    const pkg = readPackageJson(path.join(repoRoot, workspace));
    return Boolean(pkg.scripts?.[script]);
  });
};

const main = () => {
  const script = process.argv[2];

  if (!script) {
    console.error('runLite - usage: tsx ./scripts/runLite.ts <script-name>');
    process.exit(1);
  }

  const workspaces = getOrderedWorkspaces();
  const toRun = getChangedWorkspaces(workspaces, script);

  if (toRun.length === 0) {
    console.log(`${script}:lite - no changed workspaces with a "${script}" script, nothing to run.`);
    return;
  }

  console.log(`${script}:lite - running "${script}" in ${toRun.length} changed workspace(s):`);
  toRun.forEach((workspace) => console.log(`  - ${workspace}`));

  for (const workspace of toRun) {
    console.log(`\n> ${script} ${workspace}`);
    execSync(`npm run ${script} -w ${workspace}`, { cwd: repoRoot, stdio: 'inherit' });
  }
};

main();
