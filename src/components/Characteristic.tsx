import React, {useState} from 'react';
import {List} from 'react-native-paper';

import BleManager from 'react-native-ble-manager';
import {usePeripheral} from '../context/usePeripheral';
import {SERVICE_UUID} from '../constants';

interface ICharacteristic {
  characteristic: BleManager.Characteristic;
}

const Characteristic = (props: ICharacteristic) => {
  const {characteristic} = props;
  const [value, setValue] = useState<any>();

  const {peripheral} = usePeripheral();

  const read = async () => {
    if (!peripheral) {
      return;
    }

    const newValue = await BleManager.read(
      peripheral.id,
      SERVICE_UUID,
      characteristic.characteristic,
    );

    if (value !== undefined) {
      setValue(newValue);
    }

    console.log(
      characteristic,
      'D',
      JSON.stringify(characteristic.descriptors),
      'V',
      value,
    );
  };

  return (
    <List.Item
      title={value}
      // description={characteristic.descriptors}
      onPress={read}
    />
  );
};

export default Characteristic;
