import * as argon2 from 'argon2';
import { generateNewJson, readJsonData, writeJsonData } from './json-helpers';

export const hashAndStorePin = async (
  wearableId: number,
  wearablePin: string
) => {
  const secureData = readJsonData();
  const hashedPin = (await argon2.hash(wearablePin)).toString();

  const newJsonData = generateNewJson(secureData, wearableId, hashedPin);

  writeJsonData(newJsonData);
};
