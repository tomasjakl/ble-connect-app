import {renderHook, waitFor} from 'utils/testUtils';
import {usePermissions} from './usePermissions';
import {Permission, PermissionsAndroid, PermissionStatus} from 'react-native';

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockedRequestMultiple =
    PermissionsAndroid.requestMultiple as unknown as jest.MockedFunction<
      () => Promise<{[key in Permission]?: PermissionStatus}>
    >;

  it('initializes with default permissions state', async () => {
    mockedRequestMultiple.mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: 'denied',
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: 'denied',
      [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: 'denied',
    });

    const {result} = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isGranted).toBe(undefined);
      expect(result.current.isDenied).toBe(undefined);
    });
  });

  it('checks permissions on mount', async () => {
    const {result} = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isDenied).toBe(false);
    });
  });

  it('requests permissions successfully', async () => {
    mockedRequestMultiple.mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: 'granted',
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: 'granted',
      [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: 'granted',
    });

    const {result} = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isGranted).toBe(true);
      expect(result.current.isDenied).toBe(false);
    });
  });

  it('handles not granted permissions', async () => {
    mockedRequestMultiple.mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: 'denied',
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: 'granted',
      [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: 'granted',
    });

    const {result} = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isDenied).toBe(false);
    });
  });

  it('handles denied response', async () => {
    mockedRequestMultiple.mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: 'denied',
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: 'never_ask_again',
      [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: 'granted',
    });

    const {result} = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isGranted).toBe(false);
      expect(result.current.isDenied).toBe(true);
    });
  });
});
