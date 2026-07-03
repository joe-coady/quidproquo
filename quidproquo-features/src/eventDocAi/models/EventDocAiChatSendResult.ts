// The streamed content arrives via StateDispatch effects while the request is
// in flight; the response itself only signals completion.
export type EventDocAiChatSendResult = {
  complete: boolean;
};
