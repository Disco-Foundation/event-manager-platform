import { readJsonData } from '@event-manager/event-manager-utils';
import { Keypair } from '@solana/web3.js';

const CERTIFIERS_DATA_PATH = 'libs/event-manager-certifiers/src/lib/keyfiles';

export enum Certifier {
  airdroper = 'airdroper',
  productPayer = 'productPayer',
  testerUser = 'testerUser',
  checkInTesting = 'checkInTesting',
}

export const getCertifier = (type: Certifier) => {
  let keyPairData;

  switch (type) {
    case Certifier.airdroper:
      keyPairData = readJsonData(CERTIFIERS_DATA_PATH + '/a.json');
      break;
    case Certifier.productPayer:
      keyPairData = {
        s: [
          60, 102, 88, 60, 29, 185, 28, 117, 255, 27, 18, 14, 64, 145, 15, 41,
          19, 145, 79, 242, 64, 31, 3, 88, 227, 253, 39, 59, 98, 3, 80, 7, 220,
          189, 7, 78, 28, 156, 115, 140, 23, 66, 0, 36, 128, 159, 16, 129, 178,
          22, 78, 24, 171, 103, 4, 125, 110, 11, 89, 202, 129, 32, 148, 22,
        ],
      };
      break;
    case Certifier.testerUser:
      keyPairData = readJsonData(CERTIFIERS_DATA_PATH + '/t.json');
      break;
    case Certifier.checkInTesting:
      keyPairData = {
        s: [
          76, -29, -92, 26, 53, -99, 63, -90, 38, 104, -86, -67, 81, -115, -88,
          -117, 28, -80, -28, -26, 25, -55, 79, 86, 61, 0, 121, 3, 24, -124, 4,
          -67, -74, -83, -102, 83, 31, -75, 77, -71, -20, 32, -55, -58, 99, 61,
          -22, 49, 111, -17, -55, -3, -65, -77, -79, 118, -120, -128, -33, 27,
          74, 62, -101, -119,
        ],
      };

      break;
  }

  return Keypair.fromSecretKey(
    new Uint8Array(keyPairData['s'] as unknown as ArrayBufferLike)
  );
};
