import {act, renderHook, waitFor} from 'utils/testUtils';
import {usePeripheral} from './usePeripheral';
import {Device} from 'react-native-ble-plx';

describe('usePeripheral', () => {
  it('initializes with null peripheral', () => {
    const {result} = renderHook(() => usePeripheral());
    expect(result.current.peripheral).toBeNull();
  });

  it('connects to peripheral', async () => {
    const mockPeripheral = {
      id: 'test-id',
      name: 'Test Device',
      connect: jest.fn().mockResolvedValue(true),
      discoverAllServicesAndCharacteristics: jest.fn().mockResolvedValue(true),
    } as unknown as Device;

    const {result} = renderHook(() => usePeripheral());

    await act(async () => {
      await result.current.connect(mockPeripheral);
    });

    await waitFor(() => expect(result.current.peripheral).toBe(mockPeripheral));
  });

  it('handles connection error', async () => {
    const mockPeripheral = {
      id: 'test-id',
      name: 'Test Device',
      connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
    } as unknown as Device;

    const {result} = renderHook(() => usePeripheral());

    await act(async () => {
      try {
        await result.current.connect(mockPeripheral);
      } catch (error) {
        expect(error instanceof Error && error.message).toBe(
          'Connection failed',
        );
      }
    });

    expect(result.current.peripheral).toBeNull();
  });
});
