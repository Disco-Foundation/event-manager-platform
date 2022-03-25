import { readJsonData } from '@event-manager/event-manager-utils';
import * as argon2 from 'argon2';
import { SECURE_DATA_PATH } from '../../core';

export const checkWearablePin = async (
  wearableId: number,
  wearablePin: string
): Promise<boolean> => {
  const secureData = readJsonData(SECURE_DATA_PATH + '/secure-data.json');
  if (!secureData[wearableId]) return false;

  return await argon2.verify(secureData[wearableId], wearablePin);
};
