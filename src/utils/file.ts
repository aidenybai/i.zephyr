import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 4);

export interface Store {
  files: Record<string, File>[];
}

export interface File {
  name: string;
  path: string;
  timestamp: number;
}

export const createCodedFileName = (fileName: string, raw: boolean): string => {
  const nameParts = fileName.split('.');
  const ext = nameParts.pop();
  const randomizer = `-${nanoid()}`;
  return `${nameParts.join('.').replace(/(\d+(?:-+\d+)+)?[\W\-_]+/g, '$1-')}${
    raw ? '' : randomizer
  }.${ext}`;
};

export const createFileObject = (codedFileName: string, codedFilePath: string): File => ({
  name: codedFileName,
  path: codedFilePath,
  timestamp: Date.now(),
});
