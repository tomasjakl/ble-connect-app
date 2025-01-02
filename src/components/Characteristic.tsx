import React, {useEffect, useMemo, useRef, useState} from 'react';
import EditDialog from './EditDialog';
import {IconButton, List, Portal} from 'react-native-paper';
import {Characteristic as ICharacteristic} from 'react-native-ble-plx';
import {Buffer} from 'buffer';

import {
  GATT_DESCRIPTION_DESCRIPTOR_UUID,
  GATT_PRESENTATION_DESCRIPTOR_UUID,
} from '../constants';
import {GattFormat} from '../enums';
import {StyleProp, TextStyle} from 'react-native';
import {convertFromGatt, convertToGatt} from '../utils/ble';
import {GattValue} from '../types/ble';

interface Props {
  characteristic: ICharacteristic;
}

const Characteristic = (props: Props) => {
  const {characteristic} = props;

  const [value, setValue] = useState<GattValue>();
  const [description, setDescription] = useState<string>();
  const exponent = useRef<number>(0);
  const format = useRef<GattFormat>(GattFormat.utf8);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);

  const valueString = useMemo(
    () => (value !== undefined ? value.toString() : undefined),
    [value],
  );

  const showDialog = () => {
    setIsDialogVisible(true);
  };

  const hideDialog = () => setIsDialogVisible(false);

  const saveValue = async (newValue: GattValue) => {
    const convertedValue = convertToGatt(
      newValue,
      format.current,
      exponent.current,
    );

    characteristic.isWritableWithResponse
      ? await characteristic.writeWithResponse(convertedValue)
      : await characteristic.writeWithoutResponse(convertedValue);

    hideDialog();

    read();
  };

  const read = async () => {
    const {value: newValue} = await characteristic.read();

    if (newValue === null) {
      return;
    }

    setValue(convertFromGatt(newValue, format.current, exponent.current));
  };

  const descriptionStyle: StyleProp<TextStyle> = {
    fontWeight: 'bold',
    ...(format.current === GattFormat.boolean && {
      color: value ? '#50de1d' : '#fc3112',
    }),
  };

  useEffect(() => {
    const readDescription = async () => {
      const descriptionDescriptor = await characteristic.readDescriptor(
        GATT_DESCRIPTION_DESCRIPTOR_UUID,
      );

      if (descriptionDescriptor.value !== null) {
        setDescription(
          Buffer.from(descriptionDescriptor.value, 'base64').toString('utf8'),
        );
      }
    };

    const readPresentation = async () => {
      const presentationDescriptor = await characteristic.readDescriptor(
        GATT_PRESENTATION_DESCRIPTOR_UUID,
      );

      if (presentationDescriptor.value !== null) {
        const buffer = Buffer.from(presentationDescriptor.value, 'base64');

        format.current = buffer.readInt8(0);
        exponent.current = buffer.readInt8(1);

        characteristic.isNotifiable &&
          characteristic.monitor((_error, updatedCharacteristic) => {
            if (
              !updatedCharacteristic ||
              updatedCharacteristic.value === null
            ) {
              return;
            }

            setValue(
              convertFromGatt(
                updatedCharacteristic.value,
                format.current,
                exponent.current,
              ),
            );
          });

        const {value: newValue} = await characteristic.read();

        if (newValue === null) {
          return;
        }

        setValue(convertFromGatt(newValue, format.current, exponent.current));
      }
    };

    (async () => {
      try {
        await Promise.all([readDescription(), readPresentation()]);
      } catch (error) {
        console.warn(error);
      }
    })();
  }, [characteristic]);

  return (
    <>
      <List.Item
        title={description}
        description={valueString}
        descriptionStyle={descriptionStyle}
        onPress={read}
        left={
          characteristic.isNotifiable
            ? p => <List.Icon {...p} icon="circle-outline" />
            : undefined
        }
        right={
          characteristic.isWritableWithResponse ||
          characteristic.isWritableWithoutResponse
            ? p => (
                <IconButton
                  {...p}
                  icon="pencil"
                  onPress={showDialog}
                  aria-label="Edit"
                />
              )
            : undefined
        }
      />
      <Portal>
        <EditDialog
          visible={isDialogVisible}
          onDismiss={hideDialog}
          description={description}
          value={value}
          onSave={saveValue}
        />
      </Portal>
    </>
  );
};

export default Characteristic;
