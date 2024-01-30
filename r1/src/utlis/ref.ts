import { promises } from 'fs';
import { resolve as resolvePath } from 'path';

import type { Ref } from '../types/test-config';

export function isRef(item: any): item is Ref {
  return item && typeof item.$ref === 'string';
}

export async function resolve(path: string, basePath: string) {
  // TODO: currently we resolve only FS refs
  return promises.readFile(resolvePath(path, basePath), { encoding: 'utf8' });
}
