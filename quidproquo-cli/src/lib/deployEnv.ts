import { getQpqAppDeployConfig } from 'quidproquo-deploy-awscdk';

import { findPlatformDriver, getPlatformDriver, QpqDeployPlatform } from '../platforms';
import { getArgValue } from './args';
import { getRoot } from './discovery';
import { promptSelect } from './prompts';

// Best-effort identity priming for local dev/build commands (go:dev, synth):
// fills ENVIRONMENT and the platform driver's identity env vars from the app's
// deploy.config.json when they're unset — never prompts, never exits. Service
// configs read those env vars at load time, so this must run before any
// infrastructure.ts is required.
export const primeDeployEnvFromConfig = (appName: string, defaultEnvironment = 'development'): void => {
  process.env.ENVIRONMENT = process.env.ENVIRONMENT || defaultEnvironment;

  try {
    const deployConfig = getQpqAppDeployConfig(getRoot(), appName);
    const target = deployConfig.environments?.[process.env.ENVIRONMENT];

    findPlatformDriver(target?.platform || QpqDeployPlatform.aws)?.primeDeployIdentity(target);
  } catch {
    // no deploy.config.json — fine for local dev
  }
};

export interface ResolvedDeployEnvironment {
  environment: string;
  // The deploy platform driver for this environment: --platform flag, then
  // the environment's "platform" in deploy.config.json, then aws.
  platform: string;
}

// Resolves the deploy identity for an app and primes the process environment
// with it. The app's deploy.config.json owns environment -> platform +
// identity (config-owned identity); already-set env vars win, so CI overrides
// and older setups keep working.
//
// Environment resolution: --env flag, then the sole configured environment,
// then an interactive prompt over the configured environments (a shell
// ENVIRONMENT is only the prompt's default, never a silent pick), then — for
// headless runs and configs without an environments map — ENVIRONMENT itself.
export const resolveDeployEnvironment = async (argv: string[], appName: string): Promise<ResolvedDeployEnvironment> => {
  const deployConfig = getQpqAppDeployConfig(getRoot(), appName);
  const configuredEnvironments = Object.keys(deployConfig.environments ?? {});

  let environment = getArgValue(argv, '--env');

  if (!environment && configuredEnvironments.length === 1) {
    environment = configuredEnvironments[0];
    console.log(`Using environment: ${environment}`);
  }

  if (!environment && configuredEnvironments.length > 1 && process.stdin.isTTY) {
    const defaultEnvironment =
      process.env.ENVIRONMENT && configuredEnvironments.includes(process.env.ENVIRONMENT) ? process.env.ENVIRONMENT : undefined;
    environment = await promptSelect('Select environment', configuredEnvironments, defaultEnvironment);
  }

  if (!environment) {
    environment = process.env.ENVIRONMENT;
  }

  if (!environment) {
    console.error(`No environment selected — pass --env <name> or add "environments" to apps/${appName}/deploy.config.json`);
    process.exit(1);
  }

  process.env.ENVIRONMENT = environment;

  const target = deployConfig.environments?.[environment];
  const platform = getArgValue(argv, '--platform') || target?.platform || QpqDeployPlatform.aws;

  const missingIdentity = getPlatformDriver(platform).primeDeployIdentity(target);
  if (missingIdentity.length > 0) {
    console.error(
      `Deploy identity for environment '${environment}' (platform '${platform}') is incomplete — missing ${missingIdentity.join(', ')}. Add it to apps/${appName}/deploy.config.json under "environments".`,
    );
    process.exit(1);
  }

  return { environment, platform };
};
