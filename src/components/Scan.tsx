import React, {useEffect, useState} from 'react';
import {BleError, Device, ScanMode, State} from 'react-native-ble-plx';
import {Banner, List, Text} from 'react-native-paper';
import {ESP32_SERVICE_UUID} from '../constants';

import {bleManager, usePeripheral} from '../context/usePeripheral';
import {usePermissions} from '../hooks/usePermissions';
import {Linking, StyleSheet} from 'react-native';

const Scan = () => {
  const [peripherals, setPeripherals] = useState<Device[]>([]);
  const [btState, setBtState] = useState<State>();
  const [isScanning, setIsScanning] = useState(false);

  const {connect} = usePeripheral();
  const {isGranted, isDenied, request} = usePermissions();

  const handleDiscoverPeripheral = (
    error: BleError | null,
    device: Device | null,
  ) => {
    if (error) {
      console.error(error);
    }

    if (!device) {
      return;
    }

    setPeripherals(previous => {
      const existingIndex = previous.findIndex(item => item.id === device.id);

      if (existingIndex < 0) {
        return [...previous, device];
      }

      const existingDevice = previous[existingIndex];

      if (existingDevice.localName === device.localName) {
        return previous;
      }

      const updated = [...previous];
      updated[existingIndex] = device;
      return updated;
    });
  };

  useEffect(() => {
    const subscription = bleManager.onStateChange(state => {
      setBtState(state);
    }, true);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (btState !== State.PoweredOn || !isGranted) {
      return;
    }

    (async () => {
      await bleManager.startDeviceScan(
        [ESP32_SERVICE_UUID],
        {scanMode: ScanMode.Balanced},
        handleDiscoverPeripheral,
      );

      setIsScanning(true);
    })();

    return () => {
      (async () => {
        await bleManager.stopDeviceScan();

        setIsScanning(false);
      })();
    };
  }, [btState, isGranted]);

  return (
    <>
      <Banner
        visible={!!isGranted && btState === State.PoweredOff}
        actions={[
          {
            label: 'Enable Bluetooth',
            onPress: () => bleManager.enable(),
          },
        ]}>
        Bluetooth is currently turned off. Please enable it to proceed.
      </Banner>

      <Banner
        visible={isGranted === false && isDenied === false}
        actions={[
          {
            label: 'Grant Permissions',
            onPress: request,
          },
        ]}>
        Please grant the necessary permissions to proceed.
      </Banner>

      <Banner
        visible={!!isDenied}
        actions={[
          {
            label: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ]}>
        You have denied the necessary permissions. Please enable them in your
        settings.
      </Banner>

      {isGranted &&
        btState === State.PoweredOn &&
        peripherals.map(peripheral => (
          <List.Item
            key={peripheral.id}
            title={peripheral.localName ?? 'Unknown Device'}
            description={peripheral.id}
            left={props => <List.Icon {...props} icon="bluetooth" />}
            onPress={() => connect(peripheral)}
          />
        ))}

      {isScanning && (
        <Text variant="bodySmall" style={styles.searchingText}>
          Searching for nearby Bluetooth devices...
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  searchingText: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.5,
  },
});

export default Scan;
