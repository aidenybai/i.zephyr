import { nanoid } from 'nanoid';

export interface Store {
  files: Record<string, File>[];
}

export interface File {
  fileName: string;
  filePath: string;
  accessedCount: number;
}

export const createCodedFileName = (fileName: string): string => {
  return fileName.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, '-') + `.${nanoid()}`;
};

export const createFileObject = (codedFileName: string, codedFilePath: string): File => ({
  fileName: codedFileName,
  filePath: codedFilePath,
  accessedCount: 0,
});
