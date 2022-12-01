// Note: Error enum text may be surfaced to the user
//
export enum ErrorTypeEnum {
  // User failed to provide a valid user name/password required for access this resources
  // ~ Not logged in
  Unauthorized = 'Unauthorized',

  // PaymentRequired to access this resource or run action
  PaymentRequired = 'PaymentRequired',

  // Not enough privileges to access this resource ~ Logged in but not good enough
  Forbidden = 'Forbidden',

  // Resource was not found
  NotFound = 'NotFound',

  // Request or action took to long
  TimeOut = 'TimeOut',

  // Resource of incorrect format
  UnsupportedMediaType = 'UnsupportedMediaType',

  // System / downstream action is out of resources
  OutOfResources = 'OutOfResources',

  // Generic error cover all ~ Think 500 in a web server
  GenericError = 'GenericError',

  // Resource or action not yet implemented
  NotImplemented = 'NotImplemented',
}
