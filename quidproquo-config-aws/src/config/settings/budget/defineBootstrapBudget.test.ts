import { describe, expect, it } from 'vitest';

import { QPQAwsConfigSettingType } from '../../QPQConfig';
import { BudgetThresholdType, defineBootstrapBudget } from './defineBootstrapBudget';

describe('defineBootstrapBudget', () => {
  it('builds a budget setting keyed by name with undefined options when omitted', () => {
    expect(defineBootstrapBudget('main', 100, ['ops@example.com'])).toEqual({
      configSettingType: QPQAwsConfigSettingType.bootstrapBudget,
      uniqueKey: 'main',
      name: 'main',
      monthlyLimitUsd: 100,
      subscriberEmails: ['ops@example.com'],
      thresholds: undefined,
      anomalyDetection: undefined,
    });
  });

  it('carries through the supplied options', () => {
    const thresholds = [{ thresholdPercent: 90, type: BudgetThresholdType.forecasted }];

    expect(
      defineBootstrapBudget('main', 250, ['ops@example.com', 'dev@example.com'], {
        thresholds,
        anomalyDetection: { disabled: true, minimumImpactUsd: 25 },
      }),
    ).toEqual({
      configSettingType: QPQAwsConfigSettingType.bootstrapBudget,
      uniqueKey: 'main',
      name: 'main',
      monthlyLimitUsd: 250,
      subscriberEmails: ['ops@example.com', 'dev@example.com'],
      thresholds,
      anomalyDetection: { disabled: true, minimumImpactUsd: 25 },
    });
  });
});
