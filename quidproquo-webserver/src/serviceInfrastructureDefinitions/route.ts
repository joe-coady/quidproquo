import { HTTPMethod, HTTPRoute } from "../types/httpTypes";
import { SrcPathname, MethodName } from "../types/srcFileTypes";
import { RouteOptions } from "../types/routeTypes";
import {
  ServiceInfrastructureConfig,
  ServiceInfrastructureConfigType,
} from "./ServiceInfrastructureConfig";

export interface RouteInfrastructureConfig extends ServiceInfrastructureConfig {
  method: HTTPMethod;
  path: HTTPRoute;
  src: SrcPathname;
  runtime: MethodName;
  options: RouteOptions;
}

export const defineRoute = (
  method: HTTPMethod,
  path: HTTPRoute,
  src: SrcPathname,
  runtime: MethodName,
  options: RouteOptions = {}
): RouteInfrastructureConfig => ({
  serviceInfrastructureConfigType: ServiceInfrastructureConfigType.ROUTE,

  method,
  path,
  src,
  runtime,
  options,
});
