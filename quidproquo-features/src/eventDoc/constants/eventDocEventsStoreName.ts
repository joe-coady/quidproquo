// Events-table name derived by convention so a collection needs only one storeName.
//
// LEGACY: numeric sort key, holding every event written before sortable ids. Still declared
// so the table is retained and the data stays reachable for the migration; nothing reads or
// writes it at runtime any more.
export const eventDocLegacyEventsStoreName = (storeName: string): string => `${storeName}Events`;

// The live log. A separate table because a DynamoDB key schema cannot be altered in place
// and the sort key changed from number to string when event ids became sortable ids.
export const eventDocEventsStoreName = (storeName: string): string => `${storeName}EventLog`;
