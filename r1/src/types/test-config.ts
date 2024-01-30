interface AppOptions {
  configPath: string;
}

interface IDefaults {
  apiBase?: string;
  parameters?: IParameter[];
}

interface IParameter {
  in: 'header' | 'query' | 'path';
  name: string;
  value: string;
}

interface IExpect {
  status?: number;
  body?: any;
  mimeType?: string;
  schema?: Record<string, string>;
  assert?: string;
  snapshot?: any;
}

export interface Ref {
  $ref: string;
}

interface ITest {
  name?: string;
  path: string;
  method: OperationMethod;
  requestBody?: any;
  expect?: IExpect;
  assert: string | Ref;
  parameters: IParameter[];
  inherit?: 'auto' | 'none'
}

interface TestConfig {
  definition?: string;
  defaults?: IDefaults;
  flows: {
    [key: string]: ITest[];
  };
}

type OperationMethod = 'get' | 'post' | 'put' | 'delete';

type IFlow = ITest[];

export { TestConfig, ITest, IDefaults, IExpect, IParameter, IFlow, OperationMethod, AppOptions };
