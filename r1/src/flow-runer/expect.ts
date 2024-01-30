import { ResultToRun } from '../utlis/api-fetcher';
import Ajv from '@redocly/ajv';
import { Checks } from './checks';
import { IExpect } from '../types/test-config';
import { TestContext } from '.';
import { parseJson } from '../utlis/parse-config';

const ajv = new Ajv({
  schemaId: '$id',
  meta: true,
  allErrors: true,
  strictSchema: false,
  inlineRefs: false,
  validateSchema: false,
  discriminator: true,
  allowUnionTypes: true,
  validateFormats: false, // TODO: fix it
  logger: false,
  defaultAdditionalProperties: false,
});

export interface ICheck {
  pass: boolean;
  name: string;
  expected?: string;
  actual?: string | null;
}

const runAssert = (value: any, expectedValue: any) => {
  return JSON.stringify(value) === JSON.stringify(expectedValue);
};

//TODO: ALSO save if results mach or not
export const checkExpect = (expect: IExpect = {}, result: ResultToRun, ctx: TestContext ) => {
  const checks: ICheck[] = [];
  const { body: resultBody, code, headers } = result;
  const { status, body, mimeType, schema } = expect;

  if (status) {
    checks.push({
      name: Checks.statusCode,
      pass: runAssert(code, status),
      expected: `${status}`,
      actual: `${code}`,
    });
  }

  if (body) {
    const bodyToCheck = parseJson(body, ctx)
    checks.push({
      name: Checks.body,
      pass: runAssert(resultBody, bodyToCheck),
      expected: JSON.stringify(bodyToCheck),
      actual: JSON.stringify(resultBody),
    });
  }

  if (mimeType) {
    checks.push({
      name: Checks.mimeType,
      pass: headers.get('content-type') ? runAssert(headers.get('content-type'), mimeType) : false,
      expected: mimeType,
      actual: headers.get('content-type'),
    });
  }

  if (schema) {
    const schemaToCheck = parseJson(schema, ctx);
    checks.push({
      name: Checks.schema,
      pass: ajv.validate(schemaToCheck, resultBody),
      expected: JSON.stringify(schemaToCheck, null, 2),
      actual: JSON.stringify(resultBody, null, 2),
    });
  }

  return checks;
};


// TODO: GENERATE expect and check from definition
export const checkExpectFromDefinition = (operationResponses: any , result: ResultToRun): ICheck[] => {
  const checks: ICheck[] = [];

  const { code, body, headers} = result;

  // const contentType = headers.get()



  return checks

}
