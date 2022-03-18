import * as argon2 from 'argon2';
import { readJsonData } from './json-helpers';

export const checkWearablePin = async (
  wearableId: number,
  wearablePin: string
): Promise<boolean> => {
  const secureData = readJsonData();
  if (!secureData[wearableId]) return false;

  return await argon2.verify(secureData[wearableId], wearablePin);
};
