import { CustomMessageTriggerEvent, Context } from 'aws-lambda';
import { Liquid } from 'liquidjs';

import { EmailTemplates } from 'quidproquo-core';

// @ts-ignore - Special webpack loader
import qpqEmailTemplates from 'qpq-user-directory-email-templates!';

export interface EmailPayload {
  username: string;
  code: string;

  userAttributes: Record<string, string>;
  baseDomain: string;
}

export const renderTemplate = async (template: string, data: EmailPayload) => {
  const engine = new Liquid();

  const output = await engine.parseAndRender(template, data);

  return output;
};

export const getTemplates = (): EmailTemplates => {
  const emailTemplates: Record<string, EmailTemplates> = qpqEmailTemplates;
  const templates = emailTemplates[process.env.userDirectoryName!];

  return templates;
};

export const executeCognitoTriggerEvent = async (
  event: CustomMessageTriggerEvent,
  context: Context,
) => {
  console.log(
    `executeCognitoTriggerEvent: Started [${event.triggerSource}]`,
    JSON.stringify(event, null, 2),
  );

  const params = {
    baseDomain: 'joecoady.development.kitted.app',
    code: event.request.codeParameter,
    userAttributes: event.request.userAttributes,
    username: event.userName,
  };

  const templates = getTemplates();

  switch (event.triggerSource) {
    case 'CustomMessage_ForgotPassword':
      event.response.emailMessage = await renderTemplate(templates.resetPassword!.body, params);
      event.response.emailSubject = await renderTemplate(templates.resetPassword!.subject, params);
      break;

    case 'CustomMessage_VerifyUserAttribute':
      event.response.emailMessage = await renderTemplate(templates.verifyEmail!.body, params);
      event.response.emailSubject = await renderTemplate(templates.verifyEmail!.subject, params);
      break;
  }

  console.log('executeCognitoTriggerEvent: Ended');

  return event;
};
