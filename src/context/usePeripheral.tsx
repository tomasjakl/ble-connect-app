import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, NativeEventEmitter, NativeModules} from 'react-native';
import BleManager, {Peripheral} from 'react-native-ble-manager';

export const bleManagerEmitter = new NativeEventEmitter(
  NativeModules.BleManager,
);

interface IPeripheralContext {
  connect: (p: Peripheral) => void;
  peripheral: Peripheral | null;
}

const PeripheralContext = createContext<IPeripheralContext>({
  connect: () => undefined,
  peripheral: null,
});

export const PeripheralProvider = (props: PropsWithChildren<{}>) => {
  const {children} = props;

  const [peripheral, setPeripheral] = useState<Peripheral | null>(null);

  useEffect(() => {
    const disconnectEvent = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      () => setPeripheral(null),
    );

    return () => {
      disconnectEvent.remove();
    };
  }, []);

  const connect = useCallback(
    async (p: Peripheral) => {
      try {
        await BleManager.connect(p.id);
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
