import React, {useEffect, useState} from 'react';
import {Characteristic as ICharacteristic} from 'react-native-ble-plx';

import {usePeripheral} from '../context/usePeripheral';
import {SERVICE_UUID} from '../constants';
import Characteristic from './Characteristic';

const Overview = () => {
  const [characteristics, setCharacteristics] = useState<ICharacteristic[]>([]);

  const {peripheral} = usePeripheral();

  useEffect(() => {
    const getServices = async () => {
      if (!peripheral) {
        return;
      }

      const newCharacteristics = await peripheral.characteristicsForService(
        SERVICE_UUID,
      );

      if (newCharacteristics) {
        setCharacteristics(newCharacteristics);
      }
    };

    getServices();
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
