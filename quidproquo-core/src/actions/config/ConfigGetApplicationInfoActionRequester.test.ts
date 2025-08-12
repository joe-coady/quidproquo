import { expectGenerator } from 'quidproquo-testing'

import { describe, expect,it } from 'vitest'

import { ConfigActionType } from './ConfigActionType'
import { askConfigGetApplicationInfo } from './ConfigGetApplicationInfoActionRequester'

describe('ConfigGetApplicationInfoActionRequester', () => {

  const standardGetApplicationInfoAction = { type: ConfigActionType.GetApplicationInfo };

  describe('askConfigGetApplicationInfo', () => {
    it('should yield an action with correct type and no payload', () => {
      expectGenerator(askConfigGetApplicationInfo())
        .toYield(standardGetApplicationInfoAction);
    })

    it('should return the value passed to next()', () => {
      const mockApplicationInfo = {
        name: 'MyApp',
        environment: 'production',
        module: 'main-module'
      }
      
      expectGenerator(askConfigGetApplicationInfo())
        .toYield(standardGetApplicationInfoAction)
        .whenGiven(mockApplicationInfo)
        .thenReturn(mockApplicationInfo)
    })

    it('should handle application info with optional feature', () => {
      const mockInfoWithFeature = {
        name: 'MyApp',
        environment: 'staging',
        module: 'auth-module',
        feature: 'login'
      }
      
      expectGenerator(askConfigGetApplicationInfo())
        .toYield(standardGetApplicationInfoAction)
        .whenGiven(mockInfoWithFeature)
        .thenReturn(mockInfoWithFeature)
    })

    it('should handle minimal required fields', () => {
      const mockMinimalInfo = {
        name: 'SimpleApp',
        environment: 'dev',
        module: 'core'
      }
      
      expectGenerator(askConfigGetApplicationInfo())
        .toYield(standardGetApplicationInfoAction)
        .whenGiven(mockMinimalInfo)
        .thenReturn(mockMinimalInfo)
    })

    it('should handle production environment application info', () => {
      const prodInfo = {
        name: 'ProductionApp',
        environment: 'production',
        module: 'api',
        feature: 'v2'
      }
      
      expectGenerator(askConfigGetApplicationInfo())
        .toYield(standardGetApplicationInfoAction)
        .whenGiven(prodInfo)
        .thenReturn(prodInfo)
    })
  })
})