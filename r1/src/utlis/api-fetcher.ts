import fetch, { Headers, Response } from 'node-fetch';
import { parsePath } from '../utlis/parse-config';
import { OperationMethod } from '../types/test-config';
import { merge } from 'lodash';

interface IFetcher {
  apiBase: string;
  method?: OperationMethod;
  path?: string;
  defaultParameters?: IRequestParameters;
  overrideParameters?: IRequestParameters;
}

interface IRequestParameters {
  pathParams?: Record<string, string | number>;
  queryParams?: Record<string, string>;
  headerParams?: Record<string, string>;
  requestBody?: any;
}

export interface ResultToRun {
  body: any;
  code: number;
  headers: Headers;
}

export class ApiFetcher implements IFetcher {
  apiBase: string;
  path?: string;
  method?: OperationMethod;
  defaultParameters: IRequestParameters = {};
  overrideParameters: IRequestParameters = {};

  constructor(params: IFetcher) {
    this.apiBase = params.apiBase;
    this.path = params.path;
    this.method = params.method;
    this.defaultParameters = params.defaultParameters || {};
  }

  setApiBase = (apiBase: string) => {
    this.apiBase = apiBase;
  };

  setOverrideParameters = (overrideParameters: IRequestParameters) => {
    this.overrideParameters = overrideParameters;
  };

  setDefaultsParameters = (defaultParameters: IRequestParameters) => {
    this.defaultParameters = defaultParameters;
  };

  setMethod = (method: OperationMethod) => {
    this.method = method;
  };

  setPath = (path: string) => {
    this.path = path;
  };

  mergeDefaultParamsWithOverride = (
    defaultsParams: IRequestParameters,
    ovverideParams: IRequestParameters
  ): IRequestParameters => {
    return merge(defaultsParams, ovverideParams);
  };

  // TODO: HANDLE QUERY PARAMS

  fetchResult = async (): Promise<ResultToRun | undefined> => {
    const { pathParams, queryParams = {}, headerParams, requestBody } =
      this.mergeDefaultParamsWithOverride(this.defaultParameters, this.overrideParameters);
    const preparedPath = parsePath(this.path, pathParams);
    const searchParams = new URLSearchParams(queryParams)

    const pathToFetch = `${this.apiBase}${preparedPath}?${searchParams.toString()}`;

    try {
      const result: Response = await fetch(pathToFetch, {
        method: this.method,
        headers: headerParams,
        ...((this.method === 'post' || this.method === 'put') && {
          body: JSON.stringify(requestBody),
        }),
      });

      return {
        body: await result.json(),
        code: result.status,
        headers: result.headers,
      };
    } catch (e) {
      console.log(e, 'GOD DAMN ERROR');
      return;
    }
  };
}
