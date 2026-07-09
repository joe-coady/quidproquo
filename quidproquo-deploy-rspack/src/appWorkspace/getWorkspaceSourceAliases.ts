// Maps each workspace lib package (by name) to its src/index.ts so the
// dev-server rspack build can bundle workspace code from *source* instead of
// built dist. This is what puts lib edits in rspack's watch graph.
// Service/tool packages without a src/index.ts are skipped; they're never
// imported by package name.
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

export const getWorkspaceSourceAliases = (root: string): WorkspaceSourceAliases => {
  const rootPackageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
  const workspaceGlobs: string[] = rootPackageJson.workspaces || [];

  const aliases: Record<string, string> = {};
  const packageNames = new Set<string>();

  for (const pattern of workspaceGlobs) {
    for (const dir of expandWorkspacePattern(root, pattern)) {
      const packageJsonPath = path.join(dir, 'package.json');
      const srcIndexPath = path.join(dir, 'src', 'index.ts');
      if (!fs.existsSync(packageJsonPath) || !fs.existsSync(srcIndexPath)) {
        continue;
      }

      const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      aliases[`${name}$`] = srcIndexPath;
      packageNames.add(name);
    }
  }

  return { aliases, packageNames };
};
