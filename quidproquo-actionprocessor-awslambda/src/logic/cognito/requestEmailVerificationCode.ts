import { AuthenticationDeliveryDetails } from 'quidproquo-core';

import {
  CognitoIdentityProviderClient,
  GetUserAttributeVerificationCodeCommand,
  GetUserAttributeVerificationCodeCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

import { createAwsClient } from '../createAwsClient';

export const requestEmailVerificationCode = async (region: string, accessToken: string): Promise<AuthenticationDeliveryDetails> => {
  const cognitoClient = createAwsClient(CognitoIdentityProviderClient, {
    region,
  });

  const params: GetUserAttributeVerificationCodeCommandInput = {
    AccessToken: accessToken,
    AttributeName: 'email', // Request verification for the email attribute
  };

  const response = await cognitoClient.send(new GetUserAttributeVerificationCodeCommand(params));

  const deliveryInfo = {
    attributeName: response.CodeDeliveryDetails?.AttributeName || 'email',
    destination: response.CodeDeliveryDetails?.Destination || 'unknown@email.com',
    deliveryMedium: response.CodeDeliveryDetails?.DeliveryMedium || 'EMAIL',
  } as AuthenticationDeliveryDetails;

  return deliveryInfo;
};
