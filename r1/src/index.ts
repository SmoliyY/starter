import { runFLows } from './flow-runer/index';
import { TestConfig } from './types/test-config';
import { readYaml } from './utlis/yaml-utils';

const run = async () => {
  // Put in here all the CLI options passed and metadata
  const options = {
    configPath: './test-config.yaml',
  };

  const parsedYaml = readYaml(options.configPath);
  await runFLows(parsedYaml as TestConfig, options);
};

run();
