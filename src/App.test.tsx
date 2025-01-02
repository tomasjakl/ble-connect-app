import React from 'react';
import {render, waitFor} from 'utils/testUtils';
import App from './App';

jest.useFakeTimers();

jest.mock('./context/usePeripheral', () => ({
  ...jest.requireActual('./context/usePeripheral'),
  usePeripheral: () => ({
    peripheral: null,
    connect: jest.fn(),
  }),
}));

describe('App', () => {
  it('renders correctly when no peripheral is connected', async () => {
    const {getByText} = render(<App />);

    await waitFor(() => {
      expect(getByText('Devices')).toBeTruthy();
    });
  });

  it('renders correctly when peripheral is connected', async () => {
    jest
      .spyOn(require('./context/usePeripheral'), 'usePeripheral')
      .mockReturnValue({
        peripheral: {
          name: 'Test Device',
          cancelConnection: jest.fn(),
          characteristicsForService: jest.fn(),
        },
      });

    const {findByText} = render(<App />);

    expect(await findByText('Test Device')).toBeTruthy();
  });
});
