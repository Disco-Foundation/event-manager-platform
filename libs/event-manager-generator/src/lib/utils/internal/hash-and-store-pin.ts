import {
  readJsonData,
  writeJsonData,
} from '@event-manager/event-manager-utils';
import * as argon2 from 'argon2';
import { SECURE_DATA_PATH } from '../../core';

export const hashAndStorePin = async (
  wearableId: number,
  wearablePin: string
) => {
  const secureData = readJsonData(SECURE_DATA_PATH + '/secure-data.json');
  const hashedPin = (await argon2.hash(wearablePin)).toString();

  secureData[wearableId] = hashedPin;

  writeJsonData(SECURE_DATA_PATH + '/secure-data.json', secureData);
};
