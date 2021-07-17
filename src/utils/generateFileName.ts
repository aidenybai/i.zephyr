import { nanoid } from 'nanoid';

export default (fileName: string): string => {
  return fileName.replace(/(?:\.(?![^.]+$)|[^\w.])+/g, "-") + `.${nanoid()}`;
};
