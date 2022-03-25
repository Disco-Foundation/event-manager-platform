import * as fs from 'fs';

export interface JsonData {
  [key: string]: string;
}

export const writeJsonData = (path: string, data: JsonData) => {
  const newJsonData = JSON.stringify(data);
  fs.writeFileSync(path, newJsonData);
};

export const readJsonData = (path: string): JsonData => {
  const rawData = fs.readFileSync(path);
  const data: JsonData = JSON.parse(rawData.toString());

  return data;
};
