import {Buffer} from 'buffer';
import {convertFromGatt, convertToGatt} from './ble';
import {GattFormat} from '../enums';

describe('BLE utils', () => {
  describe('convertFromGatt', () => {
    it('parses UTF8 string values', () => {
      const base64Value = Buffer.from('Hello World').toString('base64');
      const format = GattFormat.utf8; // UTF8
      const exponent = 0;

      const result = convertFromGatt(base64Value, format, exponent);
      expect(result).toBe('Hello World');
    });

    it('parses boolean values', () => {
      const trueValue = Buffer.from([1]).toString('base64');
      const falseValue = Buffer.from([0]).toString('base64');
      const format = GattFormat.boolean; // Boolean
      const exponent = 0;

      expect(convertFromGatt(trueValue, format, exponent)).toBe(true);
      expect(convertFromGatt(falseValue, format, exponent)).toBe(false);
    });

    it('parses numeric values with exponents', () => {
      const value = 'aBA=';
      const format = GattFormat.uInt16; // Numeric
      const exponent = -2;

      const result = convertFromGatt(value, format, exponent);
      expect(result).toBe(42);
    });

    it('handles unsupported formats', () => {
      const value = Buffer.from([1]).toString('base64');
      const format = GattFormat.opaque; // Invalid format
      const exponent = 0;

      expect(() => convertFromGatt(value, format, exponent)).toThrow();
    });
  });

  describe('convertToGatt', () => {
    it('formats string to base64', () => {
      const input = 'Hello World';
      const format = GattFormat.utf8; // UTF8
      const exponent = 0;

      const result = convertToGatt(input, format, exponent);
      const decoded = Buffer.from(result, 'base64').toString();
      expect(decoded).toBe(input);
    });

    it('formats boolean values', () => {
      const format = GattFormat.boolean; // Boolean
      const exponent = 0;

      const trueResult = convertToGatt(true, format, exponent);
      const falseResult = convertToGatt(false, format, exponent);

      expect(Buffer.from(trueResult, 'base64')[0]).toBe(1);
      expect(Buffer.from(falseResult, 'base64')[0]).toBe(0);
    });

    it('formats numeric values with exponents', () => {
      const input = 4200;
      const format = GattFormat.uInt16; // Numeric
      const exponent = 2;

      const result = convertToGatt(input, format, exponent);
      const decoded = Buffer.from(result, 'base64')[0];
      expect(decoded).toBe(42); // 4200 / 10^2
    });

    it('handles unsupported formats', () => {
      const input = 'test';
      const format = GattFormat.opaque; // Invalid format
      const exponent = 0;

      expect(() => convertToGatt(input, format, exponent)).toThrow();
    });
  });
});
