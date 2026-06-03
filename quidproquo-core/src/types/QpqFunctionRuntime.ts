/**
 * Represents a runtime function definition that can be either relative or advanced.
 *
 * Example:
 * - Advanced: { basePath: `E:/repo/project/src`, relativePath: `/service/entry/controller/admin::onAuthUpdate` }
 * - Relative: `/entry/controller/admin::onAuthUpdate`
 */
export type QpqFunctionRuntimeRelativePath = `/${string}::${string}`;
export type QpqFunctionRuntimeAdvanced = {
  basePath: string;
  relativePath: string;
  functionName: string;
};

export type QpqFunctionRuntime = QpqFunctionRuntimeAdvanced | QpqFunctionRuntimeRelativePath;
