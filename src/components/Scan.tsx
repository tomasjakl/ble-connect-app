import React, {useEffect, useState} from 'react';
import {BleError, Device, ScanMode} from 'react-native-ble-plx';
import {List} from 'react-native-paper';
import {ESP32_SERVICE_UUID} from '../constants';

import {bleManager, usePeripheral} from '../context/usePeripheral';

const Scan = () => {
  const [peripherals, setPeripherals] = useState<Device[]>([]);

  const {connect} = usePeripheral();

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
    bleManager.startDeviceScan(
      [ESP32_SERVICE_UUID],
      {scanMode: ScanMode.Balanced},
      handleDiscoverPeripheral,
    );

    return () => {
      bleManager.stopDeviceScan();
    };
  }, []);

  return (
    <>
      {peripherals.map(peripheral => (
        <List.Item
          key={peripheral.id}
          title={peripheral.localName ?? '-'}
          description={peripheral.id}
          onPress={() => connect(peripheral)}
        />
      ))}
    </>
  );
};

export default Scan;
