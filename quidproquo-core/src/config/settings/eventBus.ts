import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

/**
 * Represents detailed information about a subscription to an event bus.
 * It includes the name of the event bus ('eventBusName') as well as the module, environment, and application
 * where the event bus is deployed.
 * An optional 'feature' property can be included to further specify the subscription details.
 * This type is typically used when complete information about the event bus subscription is available and needed.
 */
export type EventBusSubscriptionDetails = {
  eventBusName: string;
  module: string;
  environment: string;
  application: string;
  feature?: string;
};

/**
 * This type is a variation of EventBusSubscriptionDetails where all properties except 'eventBusName' are optional.
 * If the optional properties are not provided, they are inferred from the context of the service that is being deployed.
 * This provides flexibility, allowing for detailed specification of the event bus subscription when needed,
 * while also allowing for simpler usage when the service context can provide the necessary details.
 */
export type PartialEventBusSubscriptionDetails = Pick<EventBusSubscriptionDetails, 'eventBusName'> &
  Partial<Omit<EventBusSubscriptionDetails, 'eventBusName'>>;

/**
 * This type represents a subscription to an event bus. It can either be a simple string representing the event bus name,
 * or a more detailed object describing the subscription. The detailed object is represented by the
 * PartialEventBusSubscriptionDetails type and includes the name of the event bus and optionally additional properties.
 * This type provides flexibility, allowing for both simple subscriptions where only the bus name is needed,
 * as well as more detailed subscriptions where additional context is necessary.
 */
export type EventBusSubscription = PartialEventBusSubscriptionDetails | string;

export interface QPQConfigAdvancedEventBusSettings extends QPQConfigAdvancedSettings {}

export interface EventBusQPQConfigSetting extends QPQConfigSetting {
  name: string;

  deprecated?: boolean;
}

export const defineEventBus = (
  name: string,
  options?: QPQConfigAdvancedEventBusSettings,
): EventBusQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.eventBus,
  uniqueKey: name,

  name,

  deprecated: !!options?.deprecated,
});
