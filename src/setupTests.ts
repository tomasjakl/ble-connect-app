import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('@react-native-vector-icons/material-design-icons');
jest.mock('@react-native-vector-icons/common');

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    cancelConnection: jest.fn(),
    onStateChange: jest.fn(_callback => ({
      remove: jest.fn().mockReturnValue({remove: jest.fn()}),
    })),
    state: jest.fn(),
    onDeviceDisconnected: jest.fn(),
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    enable: jest.fn(),
  })),
  State: {
    PoweredOn: 'PoweredOn',
    PoweredOff: 'PoweredOff',
  },
  ScanMode: {
    Balanced: 'Balanced',
  },
}));

jest.mock(
  'react-native//Libraries/PermissionsAndroid/PermissionsAndroid',
  () => ({
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
    check: jest.fn(),
    requestMultiple: jest.fn().mockResolvedValue({}),
  }),
);
