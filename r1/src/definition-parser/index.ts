import { bundle, loadConfig } from '@redocly/openapi-core';
import { existsSync } from 'fs';
import { relative } from 'path';
import { IParameter } from '../types/test-config';
import { JSONSchemaFaker } from 'json-schema-faker';
interface IDefinitionTestCases {
  requestBody?: Record<string, string>;
  parameters: IParameter[];
}

JSONSchemaFaker.option({ alwaysFakeOptionals: true });

export const bundleDefinition = async (definitionPath: string = ''): Promise<any> => {
  if (!isFileExist(definitionPath)) return;
  const config = await loadConfig();
  const bundleDocument = await bundle({
    ref: definitionPath,
    config: config,
    dereference: true,
  });

  const {
    bundle: {
      parsed: { paths },
    },
  } = bundleDocument;

  return paths;
};

export const getTestCaseFromDefinition = (
  definitionOperation: Record<string, any>
): IDefinitionTestCases => {
  const { parameters, requestBody } = definitionOperation;
  const content: Record<string, any> = requestBody?.content || {};
  const firstMimeType: Record<string, string> = Object.values(content)[0];

  const example = extractExampleFromParameters(firstMimeType?.example || firstMimeType?.examples);

  const requestBodyValue = example || generateTestDataFromJsonSchema(firstMimeType?.schema || {});

  return {
    parameters: transformParameters(parameters).filter(({value}) => value),
    ...(requestBody && { requestBody: requestBodyValue }),
  };
};

const generateTestDataFromJsonSchema = (schema: any) => {
  return JSONSchemaFaker.generate(schema);
};

const transformParameters = (params: any[]): IParameter[] => {
  return params.map((item) => {
    return {
      name: item.name,
      in: item.in,
      value: extractExampleFromParameters(item.example || item.examples),
    };
  });
};

const extractExampleFromParameters = (example: any) => {
  if (typeof example !== 'object') {
    return example;
  } else {
    const firstKey = Object.keys(example)[0];
    return example[firstKey].value || example[firstKey]
  }
};

const isFileExist = (path: string) => {
  return existsSync(relative(process.cwd(), path));
};

export const getOperationFromDefinition = (
  path: string,
  method: string,
  definitionPaths: any
): Record<string, string> | undefined => {
  return definitionPaths?.[path]?.[method] as Record<string, string>;
};
