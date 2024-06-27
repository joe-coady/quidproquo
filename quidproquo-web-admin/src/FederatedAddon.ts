import { ComponentType, MemoExoticComponent } from 'react';

export type FederatedTab = {
  name: string;
  View: ComponentType | MemoExoticComponent<ComponentType>;
};

export type FederatedAddon = {
  tab: FederatedTab;

  // We use this to detect what is an addon when importing from a federated module
  isQpqAdminFederatedAddon: boolean;
};
