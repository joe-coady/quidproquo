export enum DeployEventType {
  Infrastructure = 'Infrastructure',
  Api = 'Api',
  Web = 'Web',
}

export enum DeployEventStatusTypeEnum {
  Update = 'Update',
  Create = 'Create',
  Delete = 'Delete',
}

export type DeployEvent = {
  deployEventType: DeployEventType;
  deployEventStatusType: DeployEventStatusTypeEnum;
}

export type DeployEventResponse = void;
