// Where a staged bundle lives on the transfer drive. Exports and imports are separated so a
// download link can never be mistaken for pending import input, and the guid keeps concurrent
// operators from overwriting each other.
export const eventDocTransferExportPath = (transferId: string): string => `exports/${transferId}.json`;

export const eventDocTransferImportPath = (transferId: string): string => `imports/${transferId}.json`;

// Where the overwrite's discarded events are parked before they are deleted. Keyed by transfer AND
// doc so one forced import never clobbers another's backup, and so the file sits next to the bundle
// that caused it.
export const eventDocTransferDiscardedPath = (transferId: string, docId: string): string => `discarded/${transferId}/${docId}.json`;
