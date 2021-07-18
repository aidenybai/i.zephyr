import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 3);

export interface Store {
  files: Record<string, File>[];
}

export interface File {
  name: string;
  path: string;
  timestamp: number;
}

export const createCodedFileName = (fileName: string): string => {
  const nameParts = fileName.split('.');
  const ext = nameParts.pop();
  return `${nameParts.join('.').replace(/(\d+(?:-+\d+)+)?[\W\-_]+/g, '$1-')}-${nanoid()}.${ext}`;
};

export const createFileObject = (codedFileName: string, codedFilePath: string): File => ({
  name: codedFileName,
  path: codedFilePath,
  timestamp: Date.now(),
});
