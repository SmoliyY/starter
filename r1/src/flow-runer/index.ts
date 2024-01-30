import { ApiFetcher } from '../utlis/api-fetcher';
import { parseJson, ParsedParameters, parseParameters } from '../utlis/parse-config';
import {
  bundleDefinition,
  getOperationFromDefinition,
  getTestCaseFromDefinition,
} from '../definition-parser';

import { red, blue, green, yellow } from 'colorette';
import { checkExpect, checkExpectFromDefinition, ICheck } from './expect';
import { AppOptions, TestConfig } from '../types/test-config';
import { runAssertion } from './assert';

interface ResponseContext {
  code: number;
  body: any;
}

interface RequestContext extends ParsedParameters {
  requstBody: any;
}

export interface TestContext {
  responses: Record<string, ResponseContext>;
  requests: Record<string, RequestContext>;
  secrets: Record<string, string>;
  checks: Record<string, ICheck[]>;
  definition: any;
}

const runFLows = async (testConfig: TestConfig, options: AppOptions) => {
  const { defaults, flows, definition } = testConfig;

  const definitionPaths = { paths: (await bundleDefinition(definition)) || {} };

  const ctx: TestContext = {
    responses: {},
    requests: {},
    secrets: (process.env as {}) || {},
    checks: {},
    definition: definitionPaths,
  };

  const defaultParsedParams = parseParameters(defaults?.parameters, ctx);

  const apiClient = new ApiFetcher({
    apiBase: defaults?.apiBase || '',
  });

  apiClient.setDefaultsParameters(defaultParsedParams);

  for (const flow in flows) {
    process.stdout.write(yellow(`currently running flow ${blue(flow)}\n`));

    for (const testCase of flows[flow]) {
      const { expect, parameters, path, method, requestBody,assert, inherit = 'none' } = testCase;

      const definitionOperation = getOperationFromDefinition(path, method, definitionPaths.paths);

      if (definitionOperation && inherit === 'auto') {
        const definitionTestCase = getTestCaseFromDefinition(definitionOperation);
        const { requestBody, parameters } = definitionTestCase;
        const definitionParsedParameters = parseParameters(parameters, ctx);
        apiClient.setOverrideParameters({ requestBody, ...definitionParsedParameters });
      }

      const parsedBody = inherit === 'none' && parseJson(requestBody, ctx);
     
      const parsedParameters = parseParameters(parameters, ctx);

      inherit === 'none' &&
        apiClient.setOverrideParameters({ requestBody: parsedBody, ...parsedParameters });

      apiClient.setMethod(method);
      apiClient.setPath(path);

      const result = await apiClient.fetchResult();

      if (result) {
        const name = testCase.name || `${method}@${path}`;
        ctx.responses[name] = result;
        const checksToShow = checkExpect(expect, result, ctx);
        const assertToShow = assert && (await runAssertion(assert, result, options));
        ctx.checks[flow] = checksToShow.concat(assertToShow || []);
        displayChecks(name, ctx.checks[flow]);
      }
    }
  }
};

//TODO: ALSO save if results mach or not

const displayChecks = (name: string, checks: ICheck[]) => {
  // process.stdout.write(yellow(`\nTEST NAME - ${blue(name)} \n`));

  for (const check of checks) {
    process.stdout.write(
      `${blue(name)} > ${check.name}: ${
        check.pass
          ? '✅'
          : `❌\nEXPECTED: \n${yellow(check.expected as string)} \nACTUAL: \n${red(
              check.actual as string
            )}\n`
      } \n`
    );
  }
};

export { runFLows };
