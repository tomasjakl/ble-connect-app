import {Buffer} from 'buffer';
import {GattFormat} from '../enums';

export const parseGattValue = (
  value: string,
  format: GattFormat,
  exponent: number = -1,
) => {
  const buffer = Buffer.from(value, 'base64');

  switch (format) {
    case GattFormat.sInt16:
      return +(buffer.readInt16LE(0) * 10 ** exponent).toFixed(
        Math.abs(exponent),
      );
    case GattFormat.uInt16:
      return +(buffer.readUInt16LE(0) * 10 ** exponent).toFixed(
        Math.abs(exponent),
      );
    case GattFormat.boolean:
      return !!buffer.readInt8(0);
    case GattFormat.utf8:
      return buffer.toString('utf8');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};

export const formatGattValue = (
  value: number | string | boolean,
  format: GattFormat,
  exponent: number = -1,
) => {
  let buffer: Buffer;

  switch (format) {
    case GattFormat.sInt16:
      buffer = Buffer.alloc(2);
      buffer.writeInt16LE(Math.round(Number(value) * 10 ** -exponent));
      return buffer.toString('base64');
    case GattFormat.uInt16:
      buffer = Buffer.alloc(2);
      buffer.writeUInt16LE(Math.round(Number(value) * 10 ** -exponent));
      return buffer.toString('base64');
    case GattFormat.boolean:
      buffer = Buffer.from([value ? 1 : 0]);
      break;
    case GattFormat.utf8:
      buffer = Buffer.from(value.toString());
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return buffer.toString('base64');
};
