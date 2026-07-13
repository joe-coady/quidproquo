import { spawn } from 'child_process';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { clearLine, formatElapsed, ProgressState, renderLine } from './progressBar';

interface PackageJson {
  name: string;
  version?: string;
  workspaces?: string[];
  scripts?: Record<string, string>;
}

interface Step {
  dir: string; // workspace directory, passed to `npm -w`
  name: string; // package name, for display
  version: string;
  script: string; // package.json script to run
}

const repoRoot = path.join(__dirname, '..');

const readPackageJson = (dir: string): PackageJson =>
  JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as PackageJson;

// The `workspaces` array is the canonical build order (topologically sorted:
// core first, dependents after), matching what `npm run <script> --ws` uses.
const getOrderedWorkspaces = (): string[] => readPackageJson(repoRoot).workspaces || [];

// Scripts whose aggregate form is a sequence of sub-scripts. Driving the sub-steps
// ourselves (rather than the package's own `build`) lets the bar tick per sub-step
// and label the active one (e.g. "build:esm"). Order matters: clean before compile.
// Packages missing a sub-script skip it (build:bin-perms only exists in
// quidproquo-cli, where it restores the executable bit tsc drops from bin/;
// build:extension only in quidproquo-actionprocessor-awslambda, where it
// bundles the log-extension layer into lib/extension-layer, which clean wipes).
const STEP_EXPANSIONS: Record<string, string[]> = {
  build: ['clean', 'build:esm', 'build:cjs', 'build:bin-perms', 'build:extension'],
};

// Note: empty-string scripts (e.g. quidproquo-tsconfig's `"build": ""`) are falsy,
// so they're excluded here and such workspaces contribute zero steps.
const getScriptNames = (pkg: PackageJson, script: string): string[] => {
  const expansion = STEP_EXPANSIONS[script];
  if (expansion) {
    const present = expansion.filter((sub) => pkg.scripts?.[sub]);
    if (present.length > 0) {
      return present;
    }
  }
  return pkg.scripts?.[script] ? [script] : [];
};

// Every path git reports maps to at most one top-level workspace dir.
const getChangedDirs = (): Set<string> => {
  const changed = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.slice(3).trim()) // strip the 2-char status + space
    .filter(Boolean)
    // A rename shows as "old -> new"; the new path is what matters.
    .map((file) => (file.includes(' -> ') ? file.split(' -> ')[1] : file))
    .map((file) => file.split('/')[0]);

  return new Set(changed);
};

const buildSteps = (script: string, mode: 'all' | 'changed'): Step[] => {
  const workspaces = getOrderedWorkspaces();
  const changedDirs = mode === 'changed' ? getChangedDirs() : null;

  const steps: Step[] = [];
  for (const dir of workspaces) {
    if (changedDirs && !changedDirs.has(dir)) {
      continue;
    }

    const pkg = readPackageJson(path.join(repoRoot, dir));
    for (const scriptName of getScriptNames(pkg, script)) {
      steps.push({ dir, name: pkg.name, version: pkg.version ?? '', script: scriptName });
    }
  }

  return steps;
};

// Run one workspace script to completion, capturing all output. Nothing is streamed
// live: on success the output is discarded (tsc is quiet), on failure the caller
// prints it. stdin is inherited-as-pipe so a stray prompt can't silently hang us.
const runStep = (step: Step): Promise<{ code: number; output: string }> =>
  new Promise((resolve) => {
    const child = spawn('npm', ['run', step.script, '-w', step.dir], {
      cwd: repoRoot,
      shell: process.platform === 'win32',
    });

    let output = '';
    const collect = (buf: Buffer) => {
      output += buf.toString();
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);

    child.on('close', (code) => resolve({ code: code ?? 0, output }));
    child.on('error', (err) => resolve({ code: 1, output: String(err) }));
  });

const distinctDirs = (steps: Step[]): number => new Set(steps.map((s) => s.dir)).size;

const main = async (): Promise<void> => {
  const script = process.argv[2];
  if (!script) {
    console.error('runWorkspaces - usage: tsx ./scripts/runWorkspaces.ts <script-name> [--all|--changed]');
    process.exit(1);
  }

  const mode = process.argv[3] === '--changed' ? 'changed' : 'all';
  const steps = buildSteps(script, mode);

  if (steps.length === 0) {
    const scope = mode === 'changed' ? 'changed workspace(s)' : 'workspace(s)';
    console.log(`${script} (${mode}) - no ${scope} with a "${script}" script, nothing to run.`);
    return;
  }

  const isTty = Boolean(process.stdout.isTTY);
  const state: ProgressState = { total: steps.length, done: 0, label: '', startMs: Date.now() };
  let frame = 0;

  const draw = () => {
    if (isTty) {
      process.stdout.write(clearLine() + renderLine(state, frame));
    }
  };

  // The spinner animates on its own timer since runStep blocks (via await) on the child.
  const timer = isTty
    ? setInterval(() => {
        frame += 1;
        draw();
      }, 80)
    : undefined;

  const finish = () => {
    if (timer) {
      clearInterval(timer);
    }
    if (isTty) {
      process.stdout.write(clearLine());
    }
  };

  for (const step of steps) {
    state.label = `${step.name}@${step.version} › ${step.script}`;
    draw();
    if (!isTty) {
      console.log(`[${state.done + 1}/${state.total}] ${step.name} › ${step.script}`);
    }

    const { code, output } = await runStep(step);

    if (code !== 0) {
      finish();
      console.error(`\n✖ ${step.name} › ${step.script} failed (exit ${code}):\n`);
      console.error(output.trimEnd());
      process.exit(code);
    }

    state.done += 1;
    draw();
  }

  finish();
  console.log(
    `✔ ${script} — ${steps.length} step(s) across ${distinctDirs(steps)} workspace(s) in ${formatElapsed(
      Date.now() - state.startMs,
    )}`,
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
