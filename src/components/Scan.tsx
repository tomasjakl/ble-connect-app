import React, {useEffect, useState} from 'react';
import BleManager, {Peripheral} from 'react-native-ble-manager';
import {List} from 'react-native-paper';
import {bleManagerEmitter, usePeripheral} from '../context/usePeripheral';

const Scan = () => {
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);

  const {connect} = usePeripheral();

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    console.log('Got ble peripheral', peripheral);

    setPeripherals(previous => {
      if (previous.some(item => item.id === peripheral.id)) {
        return previous;
      }
      return [...previous, peripheral];
    });
  };

  useEffect(() => {
    const discoverEvent = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );

    BleManager.scan([], 9, true);

    return () => {
      discoverEvent.remove();
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
