import React, {useEffect, useState} from 'react';
import {Characteristic as ICharacteristic} from 'react-native-ble-plx';

import {usePeripheral} from '../context/usePeripheral';
import {ESP32_SERVICE_UUID} from '../constants';
import Characteristic from './Characteristic';

const Overview = () => {
  const [characteristics, setCharacteristics] = useState<ICharacteristic[]>([]);

  const {peripheral} = usePeripheral();

  useEffect(() => {
    (async () => {
      if (!peripheral) {
        return;
      }

      const newCharacteristics = await peripheral.characteristicsForService(
        ESP32_SERVICE_UUID,
      );

      if (newCharacteristics) {
        setCharacteristics(newCharacteristics);
      }
    })();
  }, [peripheral]);

  return (
    <>
      {characteristics.map(characteristic => (
        <Characteristic
          key={characteristic.id}
          characteristic={characteristic}
        />
      ))}
    </>
  );
};

export default Overview;
