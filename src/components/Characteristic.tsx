import React, {useEffect, useMemo, useState} from 'react';
import {
  Button,
  Dialog,
  IconButton,
  List,
  Portal,
  Switch,
  TextInput,
} from 'react-native-paper';
import {
  BleError,
  Characteristic as ICharacteristic,
  Subscription,
} from 'react-native-ble-plx';
import {Buffer} from 'buffer';

import {usePeripheral} from '../context/usePeripheral';
import {
  DESCRIPTION_DESCRIPTOR_UUID,
  PRESENTATION_DESCRIPTOR_UUID,
} from '../constants';
import {Format} from '../enums';
import {StyleProp, TextStyle} from 'react-native';

interface CharacteristicProps {
  characteristic: ICharacteristic;
}

const Characteristic = (props: CharacteristicProps) => {
  const {characteristic} = props;
  const [value, setValue] = useState<any>();

  const {peripheral} = usePeripheral();
  const [description, setDescription] = useState<string>();
  const [subscription, setSubscription] = useState<Subscription>();
  const [exponent, setExponent] = useState<number>(0);
  const [type, setType] = useState<number>(0);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [editedValue, setEditedValue] = useState<string>();

  const valueString = useMemo(
    () => value !== undefined && value.toString(),
    [value],
  );

  const showDialog = () => {
    setIsDialogVisible(true);
  };
  const hideDialog = () => setIsDialogVisible(false);

  const getValue = (
    newValue: string,
  ): string | number | boolean | undefined => {
    switch (type) {
      case Format.sInt16:
        return +(
          Buffer.from(newValue, 'base64').readInt16LE(0) *
          10 ** exponent
        ).toFixed(Math.abs(exponent));
      case Format.uInt16:
        return +(
          Buffer.from(newValue, 'base64').readUInt16LE(0) *
          10 ** exponent
        ).toFixed(Math.abs(exponent));
      case Format.boolean:
        return !!Buffer.from(newValue, 'base64').readInt8(0);
      case Format.utf8:
        return Buffer.from(newValue, 'base64').toString('utf8');
    }
  };

  const saveValue = () => {
    if (editedValue === undefined) {
      return;
    }

    let newValue: string | undefined;
    let buffer: ArrayBuffer;
    switch (type) {
      case Format.sInt16:
        buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(
          0,
          Math.round(Number(editedValue) * 10 ** -exponent),
        );
        newValue = Buffer.from(new Uint8Array(buffer).reverse()).toString(
          'base64',
        );
        break;
      case Format.uInt16:
        buffer = new ArrayBuffer(2);
        new DataView(buffer).setUint16(
          0,
          Math.round(Number(editedValue) * 10 ** -exponent),
        );
        newValue = Buffer.from(new Uint8Array(buffer).reverse()).toString(
          'base64',
        );
        break;
      case Format.boolean:
        newValue = editedValue === 'true' ? 'AQ==' : 'AA==';
        break;
      case Format.utf8:
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

  useEffect(() => {
    (async () => {
      let descriptor = (await characteristic.descriptors()).find(
        d => d.uuid === DESCRIPTION_DESCRIPTOR_UUID,
      );

      if (!descriptor) {
        return;
      }

      descriptor = await descriptor.read();

      if (!descriptor.value) {
        return;
      }

      setDescription(Buffer.from(descriptor.value, 'base64').toString('utf8'));
    })();

    (async () => {
      let descriptor = (await characteristic.descriptors()).find(
        d => d.uuid === PRESENTATION_DESCRIPTOR_UUID,
      );

      if (!descriptor) {
        return;
      }

      descriptor = await descriptor.read();

      if (!descriptor.value) {
        return;
      }

      const buffer = Buffer.from(descriptor.value, 'base64');
      setType(buffer.readInt8(0));
      setExponent(buffer.readInt8(1));
    })();
  }, [characteristic, setDescription]);

  const read = async () => {
    if (!peripheral) {
      return;
    }

    const {value: newValue} = await characteristic.read();

    if (newValue === null) {
      return;
    }

    setValue(getValue(newValue));

    if (characteristic.isNotifiable && !subscription) {
      toggleSubscription();
    }
  };

  const toggleSubscription = async () => {
    if (!characteristic.isNotifiable) {
      return;
    }

    const callback = (
      _error: BleError | null,
      updatedCharacteristic: ICharacteristic | null,
    ) => {
      if (!updatedCharacteristic || updatedCharacteristic.value === null) {
        return;
      }

      setValue(getValue(updatedCharacteristic.value));
    };

    if (subscription) {
      subscription.remove();
      setSubscription(undefined);
    } else {
      setSubscription(characteristic.monitor(callback));
    }
  };

  const descriptionStyle: StyleProp<TextStyle> = {
    fontWeight: 'bold',
    ...(type === Format.boolean && {
      color: value ? '#50de1d' : '#fc3112',
    }),
  };

  return (
    <>
      <List.Item
        title={description}
        description={valueString}
        descriptionStyle={descriptionStyle}
        onPress={read}
        onLongPress={toggleSubscription}
        left={
          characteristic.isNotifiable
            ? p => (
                <List.Icon
                  {...p}
                  icon={subscription ? 'check-circle' : 'circle-outline'}
                />
              )
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
            {[Format.sInt16, Format.uInt16].includes(type) && (
              <TextInput
                mode="outlined"
                value={editedValue === undefined ? valueString : editedValue}
                onChangeText={v => setEditedValue(v)}
                keyboardType="decimal-pad"
                // right={<TextInput.Affix text="/100" />}
              />
            )}
            {type === Format.utf8 && (
              <TextInput
                mode="outlined"
                value={editedValue === undefined ? valueString : editedValue}
                onChangeText={v => setEditedValue(v)}
              />
            )}
            {type === Format.boolean && (
              <Switch
                value={
                  editedValue === undefined ? value : editedValue === 'true'
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
