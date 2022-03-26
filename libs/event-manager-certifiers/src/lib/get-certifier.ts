import { readJsonData } from '@event-manager/event-manager-utils';
import { Keypair } from '@solana/web3.js';

const CERTIFIERS_DATA_PATH = 'libs/event-manager-certifiers/src/lib/keyfiles';

export enum Certifier {
  airdroper = 'airdroper',
  productPayer = 'productPayer',
  testerUser = 'testerUser',
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
  }

  return Keypair.fromSecretKey(
    new Uint8Array(keyPairData['s'] as unknown as ArrayBufferLike)
  );
};
