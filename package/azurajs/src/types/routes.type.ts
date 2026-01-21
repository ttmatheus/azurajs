export type ParamSource =
  | "param"
  | "query"
  | "body"
  | "headers"
  | "req"
  | "res"
  | "next"
  | "ip"
  | "useragent";

export interface ParamDefinition {
  index: number;
  type: ParamSource;
  name?: string;
}

export interface RouteDefinition {
  method: string;
  path: string;
  propertyKey: string;
  params: ParamDefinition[];
  description?: string;
}
