import QRCodeStyling, { Options } from 'qr-code-styling';

const QRDefaultOptions: Partial<Options> = {
  type: 'svg',
  margin: 5,
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: 'Q',
  },
  backgroundOptions: { color: 'transparent' },
  dotsOptions: { type: 'extra-rounded', color: '#00f0ff' },

  cornersDotOptions: { type: 'square', color: '#00f0ff' },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.15, margin: 8 },
  image: `assets/images/logo.png`,
};

const createQROptions = (data: string, size: number): Partial<Options> => {
  return {
    width: size,
    height: size,
    data: data,
    ...QRDefaultOptions,
  };
};

export const createQR = (data: string, size: number): QRCodeStyling => {
  console.log(QRCodeStyling);

  return new QRCodeStyling(createQROptions(data, size));
};
