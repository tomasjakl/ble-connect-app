import React from 'react';
import Characteristic from './Characteristic';
import {Buffer} from 'buffer';
import {render, waitFor} from 'utils/testUtils';
import {
  Descriptor,
  Characteristic as ICharacteristic,
} from 'react-native-ble-plx';

jest.useFakeTimers();

const mockCharacteristic = {
  id: 99,
  isNotifiable: true,
  isWritableWithResponse: true,
  readDescriptor: jest.fn(),
  read: jest.fn(),
  writeWithResponse: jest.fn(),
  writeWithoutResponse: jest.fn(),
  monitor: jest.fn(),
} as unknown as jest.Mocked<ICharacteristic>;

describe('Characteristic Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCharacteristic.readDescriptor.mockImplementation(async uuid => {
      if (uuid === '00002901-0000-1000-8000-00805f9b34fb') {
        return {
          value: Buffer.from('Test Description').toString('base64'),
        } as Descriptor;
      }
      if (uuid === '00002904-0000-1000-8000-00805f9b34fb') {
        return {
          value: Buffer.from([25, 0]).toString('base64'), // format: utf8, exponent: 0
        } as Descriptor;
      }
      return {value: null} as Descriptor;
    });

    mockCharacteristic.read.mockResolvedValue({
      value: Buffer.from('Test Value').toString('base64'),
    } as ICharacteristic);
  });

  it('renders with description and value', async () => {
    const {findByText} = render(
      <Characteristic characteristic={mockCharacteristic} />,
    );

    expect(await findByText('Test Description')).toBeTruthy();
    expect(await findByText('Test Value')).toBeTruthy();
  });

  it('shows edit button when characteristic is writable', async () => {
    const {findByLabelText} = render(
      <Characteristic characteristic={mockCharacteristic} />,
    );

    expect(await findByLabelText('Edit')).toBeTruthy();
  });

  it('updates value when notification is received', async () => {
    const {findByText} = render(
      <Characteristic characteristic={mockCharacteristic} />,
    );

    await waitFor(() => {
      expect(mockCharacteristic.monitor).toHaveBeenCalled();

      // Simulate notification
      const monitorCallback = mockCharacteristic.monitor.mock.calls[0][0];
      monitorCallback(null, {
        value: Buffer.from('Updated Value').toString('base64'),
      } as ICharacteristic);
    });

    expect(await findByText('Updated Value')).toBeTruthy();
  });

  it('handles error when reading descriptor fails', async () => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());

    mockCharacteristic.readDescriptor.mockImplementation(async uuid => {
      if (uuid === '00002904-0000-1000-8000-00805f9b34fb') {
        return {
          value: Buffer.from([25, 0]).toString('base64'), // format: utf8, exponent: 0
        } as Descriptor;
      }

      throw new Error('Error reading descriptor');
    });

    const {findByText} = render(
      <Characteristic characteristic={mockCharacteristic} />,
    );

    expect(await findByText('Test Value')).toBeTruthy();
  });
});
