import { TestContext } from '../flow-runer';
import { IParameter } from '../types/test-config';

export interface ParsedParameters {
  queryParams: Record<string, string>;
  pathParams: Record<string, string | number>;
  headerParams: Record<string, string>;
}

const getValueFromContext = (value: string, ctx: TestContext) => {
  const [, path] = value.toString().match(/^\${([^}]+)}$/) || [];

  return path
    ? getFrom(ctx)(path)
    : value.toString().replace(/\$\{([^}]+)}/g, (_, path) => getFrom(ctx)(path));
};

const getFrom =
  ($: Record<string, unknown> | any) =>
  (pointer: string): any => {
    if (!pointer) return $;
    let [key, ...rest] = pointer.split('.');
    return getFrom($[key])(rest.join('.'));
  };

// TODO: FIX THIS
export const parseParameters = (
  parameters: IParameter[] = [],
  ctx?: TestContext
): ParsedParameters => {
  const queryParams: Record<string, string> = {};
  const pathParams: Record<string, string> = {};
  const headerParams: Record<string, string> = {};

  for (const parameter of parameters) {
    if (parameter.in === 'query') {
      queryParams[parameter.name] = ctx
        ? getValueFromContext(parameter.value, ctx)
        : parameter.value;
    } else if (parameter.in === 'path') {
      pathParams[parameter.name] = ctx
        ? getValueFromContext(parameter.value, ctx)
        : parameter.value;
    } else if (parameter.in === 'header') {
      headerParams[parameter.name] = ctx
        ? getValueFromContext(parameter.value, ctx)
        : parameter.value;
    }
  }

  return {
    queryParams,
    pathParams,
    headerParams,
  };
};

const modifyJSON = (value: any, ctx: TestContext) => {
  if (typeof value === 'string') {
    if (value.match(/^\${([^}]+)}$/)) return getValueFromContext(value, ctx);
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined' ||
    value === null
  )
    return;

  for (const i in value as Record<string, unknown> | unknown[]) {
    if (typeof value[i] === 'string') {
      if (value[i].match(/^\${([^}]+)}$/)) value[i] = getValueFromContext(value[i], ctx);
    } else {
      modifyJSON(value[i], ctx);
    }
  }
};

export const parseJson = (objectToResolve: any, ctx: TestContext) => {
  return modifyJSON(objectToResolve, ctx) || objectToResolve;
};

export const parsePath = (
  path?: string,
  pathParams?: Record<string, string | number>
): string | undefined => {
  if (!path) return;

  const paramsWithBraces: Record<string, string | number> = {};
  for (const param in pathParams) {
    paramsWithBraces[`{${param}}`] = pathParams[param];
  }
  return path
    .split(/(\{[a-zA-Z0-9_.-]+\}+)/g)
    .map((key) => (paramsWithBraces[key] ? paramsWithBraces[key] : key))
    .join('');
};
