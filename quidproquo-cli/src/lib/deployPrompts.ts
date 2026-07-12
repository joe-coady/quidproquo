// The interactive question flow shared by `qpq go` (sequential AWS deploy) and
// a future dockerized variant: pick an app, confirm the target, pick services
// (or domain/bootstrap), pick stacks.
import { getServiceNames } from './discovery';
import { promptSelect, promptText, promptYesNo } from './prompts';

export type StackType = 'all' | 'inf' | 'api' | 'web' | 'views';

export type DeployPlan =
  | { kind: 'cancelled' }
  // Deploy only the account-level guardrails stack (one per AWS account).
  | { kind: 'account'; appName: string }
  // Deploy the bootstrap stack (and optionally the domain stack first).
  | { kind: 'bootstrap'; appName: string; includeDomain: boolean }
  // Deploy the selected stacks for the selected services.
  | {
      kind: 'services';
      appName: string;
      services: string[];
      stacks: StackType;
    };

export const promptDeployPlan = async (appName: string): Promise<DeployPlan> => {
  const deployInfo = process.env.ACTOR_NAME
    ? `${appName}-${process.env.ENVIRONMENT}-${process.env.ACTOR_NAME}`
    : `${appName}-${process.env.ENVIRONMENT}`;

  if (!(await promptYesNo(`Deploying to: [${deployInfo}]`))) {
    console.log('Exiting!');
    return { kind: 'cancelled' };
  }

  let services: string[] = [];

  do {
    const allServices = getServiceNames(appName);

    // Bracketed so the meta options can't be mistaken for actual services.
    const allText = '[ all ]';
    const accountText = '[ account ]';
    const domainEnvText = '[ domain ]';
    const bootstrapEnvText = '[ bootstrap environment ]';

    const service = await promptSelect('Select services to deploy', [allText, ...allServices, accountText, domainEnvText, bootstrapEnvText]);

    if (service === allText) {
      services = allServices;
      break;
    }
    if (service === accountText) {
      return { kind: 'account', appName };
    }
    if (service === domainEnvText) {
      return { kind: 'bootstrap', appName, includeDomain: true };
    }
    if (service === bootstrapEnvText) {
      return { kind: 'bootstrap', appName, includeDomain: false };
    }

    services.push(service);
  } while (await promptYesNo('Do you want to deploy another service?'));

  services = [...new Set(services)];

  const stacks = (await promptSelect('Stacks to deploy', ['all', 'inf', 'api', 'web', 'views'])) as StackType;

  return { kind: 'services', appName, services, stacks };
};

export type TeardownPlan =
  | { kind: 'cancelled' }
  // Destroy the web, api and inf stacks for the selected services.
  | { kind: 'services'; appName: string; services: string[] };

// The question flow for `qpq teardown`: pick services, then type the deploy
// target back to confirm — destroying inf stacks takes user data (key value
// stores, user directories) with it, so a y/n prompt isn't enough friction.
export const promptTeardownPlan = async (appName: string): Promise<TeardownPlan> => {
  const deployInfo = process.env.ACTOR_NAME
    ? `${appName}-${process.env.ENVIRONMENT}-${process.env.ACTOR_NAME}`
    : `${appName}-${process.env.ENVIRONMENT}`;

  let services: string[] = [];

  do {
    const allServices = getServiceNames(appName);
    const allText = '[ all ]';

    const service = await promptSelect('Select services to tear down', [allText, ...allServices]);

    if (service === allText) {
      services = allServices;
      break;
    }

    services.push(service);
  } while (await promptYesNo('Do you want to tear down another service?'));

  services = [...new Set(services)];

  console.log(`\nThis will DESTROY the web, api and inf stacks (including all stored data) for: ${services.join(', ')}`);
  const confirmation = await promptText(`Type '${deployInfo}' to confirm`);

  if (confirmation !== deployInfo) {
    console.log('Confirmation did not match. Exiting!');
    return { kind: 'cancelled' };
  }

  return { kind: 'services', appName, services };
};
