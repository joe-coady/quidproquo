export type FederatedTab = {
  name: string;
  View: React.ComponentType;
  icon?: React.ReactElement;
};

export type FederatedAddon = {
  tab: FederatedTab;

  // We use this to detect what is an addon when importing from a federated module
  isQpqAdminFederatedAddon: boolean;
};
