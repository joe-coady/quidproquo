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

  // Globals scoped to this function, keyed by global name. When the function's
  // story reads a global via askConfigGetGlobal, a value here takes precedence
  // over the service-wide global of the same name.
  globals?: Record<string, unknown>;
};

export type QpqFunctionRuntime = QpqFunctionRuntimeAdvanced | QpqFunctionRuntimeRelativePath;
