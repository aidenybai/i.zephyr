import { nanoid } from 'nanoid';

const generateFileName = (fileName: string): string => {
  return [...fileName.split('.'), nanoid(5)].join('-');
};

export default generateFileName;
