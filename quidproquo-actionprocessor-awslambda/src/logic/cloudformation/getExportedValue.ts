import {
  CloudFormationClient,
  ListExportsCommand,
  ListExportsCommandInput,
} from '@aws-sdk/client-cloudformation';

export const getExportedValue = async (variableName: string, region: string): Promise<string> => {
  const cloudformation = new CloudFormationClient({ region });
  const listCommandParams: ListExportsCommandInput = {};

  do {
    const result = await cloudformation.send(new ListExportsCommand(listCommandParams));

    const value = (result.Exports || []).find((e) => e.Name === variableName)?.Value;
    if (value !== undefined) {
      console.log(`CF Found: [${variableName}] = [${value}]`);
      return value;
    }

    listCommandParams.NextToken = result.NextToken;
  } while (!!listCommandParams.NextToken);

  throw new Error(`CF could not find: [${variableName}]`);
};
