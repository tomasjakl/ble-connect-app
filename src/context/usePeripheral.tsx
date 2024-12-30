import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Alert} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';

export const bleManager = new BleManager();

interface IPeripheralContext {
  connect: (p: Device) => void;
  peripheral: Device | null;
}

const PeripheralContext = createContext<IPeripheralContext>({
  connect: () => undefined,
  peripheral: null,
});

export const PeripheralProvider = (props: PropsWithChildren) => {
  const {children} = props;

  const [peripheral, setPeripheral] = useState<Device | null>(null);

  useEffect(() => {
    if (!peripheral) {
      return;
    }

    bleManager.onDeviceDisconnected(peripheral.id, () => setPeripheral(null));
  }, [peripheral]);

  const connect = useCallback(
    async (p: Device) => {
      try {
        await p.connect();
        await p.discoverAllServicesAndCharacteristics();
        setPeripheral(p);
      } catch (e) {
        Alert.alert('Failed to connect');
      }
    },
    [setPeripheral],
  );

  const value = useMemo(
    () => ({
      connect,
      peripheral,
    }),
    [connect, peripheral],
  );

  return (
    <PeripheralContext.Provider value={value}>
      {children}
    </PeripheralContext.Provider>
  );
};

export const usePeripheral = () => useContext(PeripheralContext);
