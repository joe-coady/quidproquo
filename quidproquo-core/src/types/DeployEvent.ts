export enum DeployEventType {
  Unknown = 'Unknown',
  Infrastructure = 'Infrastructure',
  Api = 'Api',
  Web = 'Web',
}

export enum DeployEventStatusTypeEnum {
  Unknown = 'Unknown',
  Update = 'Update',
  Create = 'Create',
  Delete = 'Delete',
}

export type DeployEvent = {
  deployEventType: DeployEventType;
  deployEventStatusType: DeployEventStatusTypeEnum;
}

export type DeployEventResponse = void;
