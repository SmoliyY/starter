import * as assert from 'assert';
import { dirname } from 'path';
import { Script, createContext } from 'node:vm';
import { AppOptions, ITest } from '../types/test-config';
import { isRef, resolve as resolveRef } from '../utlis/ref';
import { Checks } from './checks';
import { ICheck } from './expect';

function expect(actualValue: any) {
  // TODO: add more methods
  return {
    equal: (expectedValue: any) => {
      try {
        assert.equal(actualValue, expectedValue);
      } catch (err) {
        throw {
          expected: String(expectedValue),
          actual: String(actualValue),
          error: err,
        };
      }
    },
    match: (regExp: RegExp) => {
      try {
        assert.match(actualValue, regExp);
      } catch (err) {
        throw {
          expected: String(regExp),
          actual: String(actualValue),
          error: err,
        };
      }
    },
  };
}

export async function runAssertion(
  rawAssertion: ITest['assert'],
  context: any,
  options: AppOptions
): Promise<ICheck> {
  let parsedAssertion: string;

  if (isRef(rawAssertion)) {
    parsedAssertion = await resolveRef(rawAssertion.$ref, dirname(options.configPath));
  } else {
    parsedAssertion = rawAssertion;
  }

  if (typeof parsedAssertion !== 'string') {
    throw new TypeError(`Expected "assert" to be Function. Received: ${typeof parsedAssertion}`);
  }

  const assertionFn = new Script(parsedAssertion);

  try {
    assertionFn.runInContext(createContext({ console }))(expect, context);

    return {
      name: Checks.assert,
      pass: true,
    };
  } catch (err: any) {
    return {
      name: Checks.assert,
      pass: false,
      expected: err.expected,
      actual: err.actual,
    };
  }
}
