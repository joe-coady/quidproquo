/**
 * Represents a service function definition that can be either relative or absolute.
 * - Use the `full@` prefix for absolute paths.
 * - Omit the prefix for relative paths.
 *
 * Example:
 * - Absolute: `full@E:/repo/project/src/service/entry/controller/admin::onAuthUpdate`
 * - Relative: `/entry/controller/admin::onAuthUpdate`
 */
export type QpqFunctionRuntime = `full@${string}::${string}` | `/${string}::${string}`;
