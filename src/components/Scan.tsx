import React, {useEffect, useState} from 'react';
import {BleError, Device} from 'react-native-ble-plx';
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
      if (previous.some(item => item.id === device.id)) {
        return previous;
      }
      return [...previous, device];
    });
  };

  useEffect(() => {
    bleManager.startDeviceScan(
      [ESP32_SERVICE_UUID],
      null,
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
          title={peripheral.name ?? '-'}
          description={peripheral.id}
          onPress={() => connect(peripheral)}
        />
      ))}
    </>
  );
};

export default Scan;
