import React from 'react';
import {render, waitFor} from 'utils/testUtils';
import Overview from './Overview';
import {usePeripheral} from '../context/usePeripheral';
import {ESP32_SERVICE_UUID} from '../constants';
import Characteristic from './Characteristic';

jest.mock('../context/usePeripheral', () => ({
  ...jest.requireActual('../context/usePeripheral'),
  usePeripheral: jest.fn(),
}));

jest.mock('./Characteristic', () => jest.fn(() => null));

describe('Overview Component', () => {
  const mockCharacteristics = [
    {
      id: '1',
      uuid: 'uuid-1',
    },
    {
      id: '2',
      uuid: 'uuid-2',
    },
  ];

  const mockPeripheral = {
    characteristicsForService: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and renders characteristics when peripheral is available', async () => {
    mockPeripheral.characteristicsForService.mockResolvedValue(
      mockCharacteristics,
    );
    (usePeripheral as jest.Mock).mockReturnValue({peripheral: mockPeripheral});

    render(<Overview />);

    await waitFor(() => {
      expect(mockPeripheral.characteristicsForService).toHaveBeenCalledWith(
        ESP32_SERVICE_UUID,
      );
      expect(Characteristic).toHaveBeenCalledTimes(2);
    });
  });
});
