import { AskResponse } from 'quidproquo-core';
import { logsLogic } from 'quidproquo-webserver';

import { askEventDocAiContextRead } from '../../../eventDocAi';

export type AdminLogAiToolGetActionDetailInput = {
  index: number;
};

// See askAdminLogAiToolGetActions — same trusted-docId rule applies here.
export function* askAdminLogAiToolGetActionDetail(input: AdminLogAiToolGetActionDetailInput): AskResponse<logsLogic.LogAiToolActionDetail> {
  const { docId } = yield* askEventDocAiContextRead();

  return yield* logsLogic.askGetLogActionDetail(docId, input.index);
}
