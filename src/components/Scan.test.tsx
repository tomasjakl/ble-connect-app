import React from 'react';
import {render, screen, fireEvent, waitFor} from 'utils/testUtils';
import {Device, State} from 'react-native-ble-plx';
import {Linking} from 'react-native';
import {bleManager, usePeripheral} from '../context/usePeripheral';
import {usePermissions} from '../hooks/usePermissions';
import Scan from '../components/Scan';

jest.useFakeTimers();

jest.mock('../context/usePeripheral', () => ({
  ...jest.requireActual('../context/usePeripheral'),
  usePeripheral: jest.fn(),
}));

jest.mock('../hooks/usePermissions');

jest.spyOn(Linking, 'openSettings').mockImplementation(jest.fn());

const mockUsePeripheral = usePeripheral as jest.MockedFunction<
  typeof usePeripheral
>;
const mockUsePermissions = usePermissions as jest.MockedFunction<
  typeof usePermissions
>;

const mockBleManager = bleManager as jest.Mocked<typeof bleManager>;

const mockDevice = {id: 'device-1', localName: 'ESP32'} as Device;

describe('Scan Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePeripheral.mockReturnValue({connect: jest.fn(), peripheral: null});
    mockUsePermissions.mockReturnValue({
      isGranted: true,
      isDenied: false,
      request: jest.fn(),
    });
  });

  it('renders Bluetooth off banner when Bluetooth is powered off', () => {
    mockBleManager.onStateChange.mockImplementationOnce(callback => {
      callback(State.PoweredOff);
      return {remove: jest.fn()};
    });

    render(<Scan />);

    expect(
      screen.getByText(
        'Bluetooth is currently turned off. Please enable it to proceed.',
      ),
    ).toBeTruthy();
    fireEvent.press(screen.getByText('Enable Bluetooth'));
    expect(bleManager.enable).toHaveBeenCalled();
  });

  it('renders permission banner when permissions are not granted', () => {
    mockUsePermissions.mockReturnValue({
      isGranted: false,
      isDenied: false,
      request: jest.fn(),
    });

    render(<Scan />);

    expect(
      screen.getByText('Please grant the necessary permissions to proceed.'),
    ).toBeTruthy();
    fireEvent.press(screen.getByText('Grant Permissions'));
    expect(mockUsePermissions().request).toHaveBeenCalled();
  });

  it('renders denied permissions banner and opens settings', () => {
    mockUsePermissions.mockReturnValue({
      isGranted: false,
      isDenied: true,
      request: jest.fn(),
    });

    render(<Scan />);

    expect(
      screen.getByText(
        'You have denied the necessary permissions. Please enable them in your settings.',
      ),
    ).toBeTruthy();
    fireEvent.press(screen.getByText('Open Settings'));
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  it('renders device list when Bluetooth is on and permissions are granted', async () => {
    mockBleManager.onStateChange.mockImplementationOnce(callback => {
      callback(State.PoweredOn);
      return {remove: jest.fn()};
    });

    mockBleManager.startDeviceScan.mockImplementationOnce(
      async (_, __, callback) => {
        callback(null, mockDevice);
      },
    );

    const {getByText} = render(<Scan />);

    await waitFor(() => {
      expect(getByText('ESP32')).toBeTruthy();
      expect(getByText('device-1')).toBeTruthy();
    });
  });

  it('renders scanning text while searching for devices', async () => {
    mockBleManager.onStateChange.mockImplementationOnce(callback => {
      callback(State.PoweredOn);
      return {remove: jest.fn()};
    });

    render(<Scan />);

    await waitFor(() => {
      expect(
        screen.getByText('Searching for nearby Bluetooth devices...'),
      ).toBeTruthy();
    });
  });

  it('stops scanning on unmount', async () => {
    mockBleManager.onStateChange.mockImplementationOnce(callback => {
      callback(State.PoweredOn);
      return {remove: jest.fn()};
    });

    const {unmount} = render(<Scan />);

    unmount();

    expect(bleManager.stopDeviceScan).toHaveBeenCalled();
  });
});
