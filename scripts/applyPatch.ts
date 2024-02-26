import * as fs from 'fs';
import * as path from 'path';

type Dependencies = Record<string, string>;

interface PackageJson {
  name: string;
  version: string;
  workspaces?: string[];
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
}

interface PackageJsonVersionInfo {
  name: string;
  version: string;
}

const readPackageJson = (dir: string): PackageJson => {
  const packageJsonPath = path.join(__dirname, dir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;

  return packageJson;
};

const writePackageJson = (dir: string, packageJson: PackageJson): void => {
  const packageJsonPath = path.join(__dirname, dir, 'package.json');
  const json = JSON.stringify(packageJson, null, 2);

  fs.writeFileSync(packageJsonPath, json, 'utf8');
};

const getPackageVersionInfo = (packageJson: PackageJson): PackageJsonVersionInfo => {
  return {
    name: packageJson.name,
    version: packageJson.version,
  };
};

const linkDependencies = (
  versionInfo: Dependencies,
  srcDependencies?: Dependencies,
): Dependencies | undefined => {
  if (!srcDependencies) {
    return undefined;
  }

  return Object.keys(srcDependencies).reduce(
    (acc, dependency) => ({
      ...acc,
      [dependency]: versionInfo[dependency] || srcDependencies[dependency],
    }),
    {},
  );
};

const linkPackagesForWorkspace = (workspace: string, versionInfo: Dependencies) => {
  const packageJson = readPackageJson(`../${workspace}`);

  packageJson.dependencies = linkDependencies(versionInfo, packageJson.dependencies);
  packageJson.devDependencies = linkDependencies(versionInfo, packageJson.devDependencies);

  writePackageJson(`../${workspace}`, packageJson);
};

const main = () => {
  const mainPackageJson = readPackageJson('..');
  const workspaces = mainPackageJson.workspaces || [];

  const versionInfo = workspaces.reduce((acc, workspace) => {
    const workspacePackageJson = readPackageJson(`../${workspace}`);
    const workspaceVersionInfo = getPackageVersionInfo(workspacePackageJson);

    return { ...acc, [workspaceVersionInfo.name]: workspaceVersionInfo.version };
  }, {});

  for (const workspace of workspaces) {
    linkPackagesForWorkspace(workspace, versionInfo);
  }

  console.log('versionInfo: ', JSON.stringify(versionInfo, null, 2));
};

main();
