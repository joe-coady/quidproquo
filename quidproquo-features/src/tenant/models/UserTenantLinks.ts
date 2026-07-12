// Membership row (pk = userId): every tenant this user belongs to. Creating a
// tenant appends its id; a future invite flow appends via invitation instead.
export type UserTenantLinks = {
  userId: string;
  tenantIds: string[];
};
