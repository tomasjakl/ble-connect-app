import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Button,
  Dialog,
  IconButton,
  List,
  Portal,
  Switch,
  TextInput,
} from 'react-native-paper';
import {Characteristic as ICharacteristic} from 'react-native-ble-plx';
import {Buffer} from 'buffer';

import {
  GATT_DESCRIPTION_DESCRIPTOR_UUID,
  GATT_PRESENTATION_DESCRIPTOR_UUID,
} from '../constants';
import {GattFormat} from '../enums';
import {StyleProp, TextStyle} from 'react-native';
import {convertFromGatt} from '../utils/ble';

interface CharacteristicProps {
  characteristic: ICharacteristic;
}

type Value = string | number | boolean | undefined;

const Characteristic = (props: CharacteristicProps) => {
  const {characteristic} = props;
  const [value, setValue] = useState<Value>();

  const [description, setDescription] = useState<string>();
  const exponent = useRef<number>(0);
  const format = useRef<GattFormat>(GattFormat.utf8);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [editedValue, setEditedValue] = useState<string>();

  const valueString = useMemo(
    () => (value !== undefined ? value.toString() : undefined),
    [value],
  );

  const showDialog = () => {
    setIsDialogVisible(true);
  };

  const hideDialog = () => setIsDialogVisible(false);

  const saveValue = () => {
    if (editedValue === undefined) {
      return;
    }

    let newValue: string | undefined;
    let buffer: ArrayBuffer;
    switch (format.current) {
      case GattFormat.sInt16:
        buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(
          0,
          Math.round(Number(editedValue) * 10 ** -exponent.current),
        );
        newValue = Buffer.from(new Uint8Array(buffer).reverse()).toString(
          'base64',
        );
        break;
      case GattFormat.uInt16:
        buffer = new ArrayBuffer(2);
        new DataView(buffer).setUint16(
          0,
          Math.round(Number(editedValue) * 10 ** -exponent.current),
        );
        newValue = Buffer.from(new Uint8Array(buffer).reverse()).toString(
          'base64',
        );
        break;
      case GattFormat.boolean:
        newValue = editedValue === 'true' ? 'AQ==' : 'AA==';
        break;
      case GattFormat.utf8:
        newValue = Buffer.from(editedValue).toString('base64');
    }

    if (newValue !== undefined) {
      characteristic.isWritableWithResponse
        ? characteristic.writeWithResponse(newValue)
        : characteristic.writeWithoutResponse(newValue);

      hideDialog();
      setEditedValue(undefined);
    }
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
    (async () => {
      let descriptionDescriptor = await characteristic.readDescriptor(
        GATT_DESCRIPTION_DESCRIPTOR_UUID,
      );

      if (descriptionDescriptor.value !== null) {
        setDescription(
          Buffer.from(descriptionDescriptor.value, 'base64').toString('utf8'),
        );
      }
      let presentationDescriptor = await characteristic.readDescriptor(
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
            ? p => <List.Icon {...p} icon={'circle-outline'} />
            : undefined
        }
        right={
          characteristic.isWritableWithResponse ||
          characteristic.isWritableWithoutResponse
            ? p => <IconButton {...p} icon="pencil" onPress={showDialog} />
            : undefined
        }
      />
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{description}</Dialog.Title>
          <Dialog.Content>
            {format.current !== undefined &&
              [GattFormat.sInt16, GattFormat.uInt16].includes(
                format.current,
              ) && (
                <TextInput
                  mode="outlined"
                  value={editedValue === undefined ? valueString : editedValue}
                  onChangeText={v => setEditedValue(v)}
                  keyboardType="decimal-pad"
                />
              )}
            {format.current === GattFormat.utf8 && (
              <TextInput
                mode="outlined"
                value={editedValue === undefined ? valueString : editedValue}
                onChangeText={v => setEditedValue(v)}
              />
            )}
            {format.current === GattFormat.boolean && (
              <Switch
                value={
                  editedValue === undefined ? !!value : editedValue === 'true'
                }
                onValueChange={v => setEditedValue(v.toString())}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {editedValue !== undefined && (
              <Button onPress={saveValue}>Save</Button>
            )}
            <Button onPress={hideDialog}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default Characteristic;
