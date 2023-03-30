import { CustomMessageTriggerEvent, Context } from 'aws-lambda';
import { Liquid } from 'liquidjs';

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Email Verification</title>
    <style>
      /* Some simple styles to make the email look nice */
      body {
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        background-color: #f7f7f7;
        color: #333333;
        padding: 30px;
      }

      h1 {
        font-size: 28px;
        font-weight: bold;
        margin-top: 0;
      }

      p {
        margin-bottom: 1.5em;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      .button {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 4px;
        text-align: center;
        text-decoration: none;
        font-size: 16px;
        font-weight: bold;
        margin-top: 20px;
      }

      .button:hover {
        background-color: #0056b3;
      }
    </style>
  </head>
  <body>
    <h1>Hello, {{ username }}</h1>
    <p>Your code is <strong>{{ code }}</strong>.</p>
    <p>To verify your email, please click the button below:</p>
    <p>
      <a class="button" href="https://api.auth.{{ baseDomain }}/validate/{{code}}">Verify Email</a>
    </p>
  </body>
</html>
`;

export interface EmailPayload {
  username: string;
  code: string;

  userAttributes: Record<string, string>;
  baseDomain: string;
}

export const renderTemplate = async (template: string, data: EmailPayload) => {
  const engine = new Liquid();

  console.log('Will Render: ', JSON.stringify(data, null, 2));

  const output = await engine.parseAndRender(template, data);

  console.log(`Email Render: ${output}`);

  return output;
};

export const executeCognitoTriggerEvent = async (
  event: CustomMessageTriggerEvent,
  context: Context,
) => {
  console.log('email event', JSON.stringify(event, null, 2));

  const params = {
    baseDomain: 'joecoady.development.kitted.app',
    code: event.request.codeParameter,
    userAttributes: event.request.userAttributes,
    username: event.userName,
  };

  event.response.emailMessage = await renderTemplate(html, params);
  event.response.emailSubject = await renderTemplate(
    'Please verify your email: {{ code }}',
    params,
  );

  console.log('event.response', JSON.stringify(event.response, null, 2));

  return event;
};
