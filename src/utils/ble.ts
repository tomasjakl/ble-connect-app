import {Buffer} from 'buffer';
import {GattFormat} from '../enums';

export const convertFromGatt = (
  newValue: string,
  format: GattFormat,
  exponent: number = 1,
) => {
  switch (format) {
    case GattFormat.sInt16:
      return +(
        Buffer.from(newValue, 'base64').readInt16LE(0) *
        10 ** exponent
      ).toFixed(Math.abs(exponent));
    case GattFormat.uInt16:
      return +(
        Buffer.from(newValue, 'base64').readUInt16LE(0) *
        10 ** exponent
      ).toFixed(Math.abs(exponent));
    case GattFormat.boolean:
      return !!Buffer.from(newValue, 'base64').readInt8(0);
    case GattFormat.utf8:
      return Buffer.from(newValue, 'base64').toString('utf8');
  }
};
