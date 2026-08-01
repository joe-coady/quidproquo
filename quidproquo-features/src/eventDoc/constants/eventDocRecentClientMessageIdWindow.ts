/**
 * How many accepted clientMessageIds a folded state remembers for retry dedup
 * (EventDocDocument.recentClientMessageIds).
 *
 * The window is deliberately small: a duplicate clientMessageId is a client RETRY, and a retry
 * lands immediately after its original — within a couple of events, not hundreds later. A small
 * window keeps every folded state (and therefore every stored snapshot) a bounded size, where
 * remembering every id ever accepted would grow a document's state linearly with its log.
 *
 * The trade is explicit: a duplicate arriving more than this many accepted events after its
 * original is applied again. That is the crash-and-resume-much-later case, and the window is
 * the same for every fold path (from scratch, incremental, snapshot-seeded), so all of them
 * reach identical verdicts — a bounded window applied consistently beats an unbounded set
 * applied inconsistently.
 */
export const EVENT_DOC_RECENT_CLIENT_MESSAGE_ID_WINDOW = 10;
