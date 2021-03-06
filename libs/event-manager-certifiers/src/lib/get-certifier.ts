import { Keypair } from '@solana/web3.js';

export enum Certifier {
  airdroper = 'airdroper',
  productPayer = 'productPayer',
  testerUser = 'testerUser',
}

export const getCertifier = (type: Certifier) => {
  let keyPairData;

  switch (type) {
    case Certifier.airdroper:
      keyPairData = {
        s: [
          46, 96, 124, 77, 80, 245, 203, 163, 77, 211, 40, 138, 104, 148, 187,
          60, 81, 12, 241, 117, 115, 232, 153, 63, 42, 195, 188, 42, 205, 48,
          132, 90, 221, 146, 167, 218, 84, 99, 254, 102, 40, 80, 234, 106, 187,
          140, 152, 155, 241, 111, 221, 28, 63, 250, 155, 114, 213, 181, 68, 20,
          13, 207, 114, 235,
        ],
      };
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
      keyPairData = {
        s: [
          20, 11, 198, 199, 185, 171, 184, 92, 31, 189, 160, 13, 131, 14, 83,
          158, 218, 176, 161, 41, 208, 67, 79, 175, 135, 71, 77, 254, 228, 99,
          12, 14, 38, 229, 26, 161, 41, 83, 131, 163, 105, 55, 109, 251, 57,
          223, 240, 251, 117, 98, 212, 235, 4, 138, 232, 143, 77, 47, 17, 39,
          225, 116, 6, 5,
        ],
      };

      break;
  }

  return Keypair.fromSecretKey(
    new Uint8Array(keyPairData['s'] as unknown as ArrayBufferLike)
  );
};
