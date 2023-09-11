export enum DeployEventType {
  Infrastructure = 'Infrastructure',
  Api = 'Api',
  Web = 'Web',
}

export type DeployEvent = {
  DeployEventType: DeployEventType;
}

export type DeployEventResponse = void;
