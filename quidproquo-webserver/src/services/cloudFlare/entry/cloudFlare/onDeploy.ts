/* eslint-disable @typescript-eslint/no-unused-vars */
import { AskResponse } from 'quidproquo-core';
import { CloudFlareDnsDeployEvent, CloudFlareDnsDeployEventResponse } from '../../../../types';
import { askProcessCloudFlareDnsDeployEvent } from '../../logic/askProcessCloudFlareDnsDeployEvent';

export function* onDeploy(
  event: CloudFlareDnsDeployEvent,
): AskResponse<CloudFlareDnsDeployEventResponse> {
  yield* askProcessCloudFlareDnsDeployEvent(event);
}
