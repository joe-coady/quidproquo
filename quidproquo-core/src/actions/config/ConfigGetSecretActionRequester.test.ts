import { expectGenerator } from 'quidproquo-testing'

import { describe, it } from 'vitest'

import { ConfigActionType } from './ConfigActionType'
import { askConfigGetSecret } from './ConfigGetSecretActionRequester'

describe('ConfigGetSecretActionRequester', () => {
  describe('askConfigGetSecret', () => {
    it('should yield an action with correct type and payload', () => {
      const secretName = 'my-secret-key'
      
      expectGenerator(askConfigGetSecret(secretName))
        .toYield({
          type: ConfigActionType.GetSecret,
          payload: { secretName }
        })
    })

    it('should return the value passed to next()', () => {
      const secretName = 'test-secret'
      const mockSecretValue = 'super-secret-value'
      
      expectGenerator(askConfigGetSecret(secretName))
        .toYield({
          type: ConfigActionType.GetSecret,
          payload: { secretName }
        })
        .whenGiven(mockSecretValue)
        .thenReturn(mockSecretValue)
    })

    it('should handle empty string secret names', () => {
      const mockSecret = 'empty-name-secret'
      
      expectGenerator(askConfigGetSecret(''))
        .toYield({
          type: ConfigActionType.GetSecret,
          payload: { secretName: '' }
        })
        .whenGiven(mockSecret)
        .thenReturn(mockSecret)
    })

    it('should handle special characters in secret names', () => {
      const secretName = 'my-secret/with.special_chars-123'
      const mockSecretValue = 'special-secret-value'
      
      expectGenerator(askConfigGetSecret(secretName))
        .toYield({
          type: ConfigActionType.GetSecret,
          payload: { secretName }
        })
        .whenGiven(mockSecretValue)
        .thenReturn(mockSecretValue)
    })
  })
})