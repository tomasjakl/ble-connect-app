import React, {useState} from 'react';
import {Button} from 'react-native-paper';

import BleManager from 'react-native-ble-manager';
import {usePeripheral} from '../context/usePeripheral';
import {SERVICE_UUID} from '../constants';
import Characteristic from './Characteristic';

const Overview = () => {
  const [characteristics, setCharacteristics] = useState<
    BleManager.Characteristic[]
  >([]);

  const {peripheral} = usePeripheral();

  const getServices = async () => {
    if (!peripheral) {
      return;
    }

    const services = await BleManager.retrieveServices(peripheral.id);
    const newCharacteristics = services.characteristics?.filter(
      c => c.service === SERVICE_UUID || true,
    );

    if (newCharacteristics) {
      setCharacteristics(newCharacteristics);
    }

    console.log(JSON.stringify(newCharacteristics));
  };
  return (
    <>
      <Button onPress={getServices}>Get services</Button>
      {characteristics.map(characteristic => (
        <Characteristic
          key={characteristic.characteristic}
          characteristic={characteristic}
        />
      ))}
    </>
  );
};

export default Overview;
