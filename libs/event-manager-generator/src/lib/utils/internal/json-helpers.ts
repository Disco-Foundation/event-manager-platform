import * as fs from 'fs';
import { SECURE_DATA_PATH } from '../../core';

export interface SecureData {
  [key: string]: string;
}

export const generateNewJson = (
  oldJson: SecureData,
  id: number,
  hashedPin: string
) => {
  const newJson: SecureData = Object();
  newJson[id] = hashedPin;

  Object.keys(oldJson).forEach((key) => {
    newJson[key] = oldJson[key];
  });

  return newJson;
};

export const writeJsonData = (data: SecureData) => {
  const newJsonData = JSON.stringify(data);
  fs.writeFileSync(SECURE_DATA_PATH + '/secure-data.json', newJsonData);
};

export const readJsonData = (): SecureData => {
  const rawdata = fs.readFileSync(SECURE_DATA_PATH + '/secure-data.json');
  const secureData: SecureData = JSON.parse(rawdata.toString());

  return secureData;
};
