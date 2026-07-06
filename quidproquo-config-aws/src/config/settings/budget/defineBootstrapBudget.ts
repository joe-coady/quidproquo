import { QPQConfigSetting } from 'quidproquo-core';

import { QPQAwsConfigSettingType } from '../../QPQConfig';

export enum BudgetThresholdType {
  actual = 'actual',
  forecasted = 'forecasted',
}

export interface BudgetThreshold {
  thresholdPercent: number;
  type: BudgetThresholdType;
}

export interface BootstrapBudgetAnomalyDetection {
  /** Anomaly detection is created alongside the budget by default; set to opt out. */
  disabled?: boolean;

  /** Minimum total cost impact (USD) before an anomaly alert is sent. Defaults to 10. */
  minimumImpactUsd?: number;
}

export interface BootstrapBudgetQPQConfigSetting extends QPQConfigSetting {
  name: string;

  /** Monthly account cost budget in USD that the threshold alerts are relative to. */
  monthlyLimitUsd: number;

  /** Email addresses that receive budget threshold and cost anomaly alerts. */
  subscriberEmails: string[];

  /** Alert thresholds. Defaults to 80% actual, 100% forecasted, 100% actual, 150% actual. */
  thresholds?: BudgetThreshold[];

  anomalyDetection?: BootstrapBudgetAnomalyDetection;
}

/**
 * Account-level monthly cost budget with email threshold alerts, plus Cost Anomaly
 * Detection for spend that deviates from baseline (slow creep fixed thresholds miss).
 * Deployed in the bootstrap phase. One per account is the expected usage — AWS allows
 * only one service-dimension anomaly monitor per account.
 */
export const defineBootstrapBudget = (
  name: BootstrapBudgetQPQConfigSetting['name'],
  monthlyLimitUsd: BootstrapBudgetQPQConfigSetting['monthlyLimitUsd'],
  subscriberEmails: BootstrapBudgetQPQConfigSetting['subscriberEmails'],
  options?: Omit<BootstrapBudgetQPQConfigSetting, 'configSettingType' | 'uniqueKey' | 'name' | 'monthlyLimitUsd' | 'subscriberEmails'>,
): BootstrapBudgetQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.bootstrapBudget,
  uniqueKey: name,

  name,
  monthlyLimitUsd,
  subscriberEmails,
  thresholds: options?.thresholds,
  anomalyDetection: options?.anomalyDetection,
});
