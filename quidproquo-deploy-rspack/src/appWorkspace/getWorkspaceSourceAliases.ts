// Maps each workspace lib package (by name) to its src/index.ts so the
// dev rspack builds can bundle workspace code from *source* instead of
// built dist. This is what puts lib edits in rspack's watch graph.
// Service/tool packages without a src/index.ts are skipped; they're never
// imported by package name.
//
// Linked quidproquo packages (npm link / file: deps) are covered too: those
// node_modules entries are symlinks into the framework repo, so their src/ is
// reachable and framework edits hot-reload the same way. Registry installs
// are real directories shipping lib/ only (no src/index.ts), so they fail the
// src check and keep resolving to built output.
import fs from 'fs';
import path from 'path';

export interface WorkspaceSourceAliases {
  /** rspack resolve.alias entries, exact-match ('<name>$' -> abs src/index.ts) */
  aliases: Record<string, string>;
  /** package names covered by the aliases, for the externals allowlist */
  packageNames: Set<string>;
}

// Minimal glob expansion for workspace patterns (segments of literals and `*`)
// — avoids a glob dependency for the only shapes npm workspaces use here.
const expandWorkspacePattern = (root: string, pattern: string): string[] => {
  let dirs = [root];

  for (const segment of pattern.split('/')) {
    if (segment === '*') {
      dirs = dirs.flatMap((dir) =>
        fs.existsSync(dir)
          ? fs
              .readdirSync(dir, { withFileTypes: true })
              .filter((entry) => entry.isDirectory())
              .map((entry) => path.join(dir, entry.name))
          : [],
      );
    } else {
      dirs = dirs.map((dir) => path.join(dir, segment)).filter((dir) => fs.existsSync(dir));
    }
  }

  return dirs;
};

// Every workspace package directory (expanded from the root package.json
// workspace globs) that actually holds a package.json.
export const getWorkspacePackageDirs = (root: string): string[] => {
  const rootPackageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
  const workspaceGlobs: string[] = rootPackageJson.workspaces || [];

  return workspaceGlobs.flatMap((pattern) => expandWorkspacePattern(root, pattern)).filter((dir) => fs.existsSync(path.join(dir, 'package.json')));
};

// Real directories of quidproquo packages symlinked into the consumer's
// node_modules (npm link / file: deps point back into the framework repo).
const getLinkedQuidproquoPackageDirs = (root: string): string[] => {
  const nodeModulesDir = path.join(root, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    return [];
  }

  return fs
    .readdirSync(nodeModulesDir)
    .filter((name) => name.startsWith('quidproquo'))
    .map((name) => path.join(nodeModulesDir, name))
    .filter((dir) => fs.lstatSync(dir).isSymbolicLink())
    .map((dir) => fs.realpathSync(dir));
};

export const getWorkspaceSourceAliases = (root: string): WorkspaceSourceAliases => {
  const aliases: Record<string, string> = {};
  const packageNames = new Set<string>();

  const addSourceAlias = (dir: string): void => {
    const packageJsonPath = path.join(dir, 'package.json');
    const srcIndexPath = path.join(dir, 'src', 'index.ts');
    if (!fs.existsSync(packageJsonPath) || !fs.existsSync(srcIndexPath)) {
      return;
    }

    const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    aliases[`${name}$`] = srcIndexPath;
    packageNames.add(name);
  };

  for (const dir of getWorkspacePackageDirs(root)) {
    addSourceAlias(dir);
  }

  for (const dir of getLinkedQuidproquoPackageDirs(root)) {
    addSourceAlias(dir);
  }

  return { aliases, packageNames };
};
