import React, {useState} from 'react';
import {Button, Dialog, Switch, TextInput} from 'react-native-paper';
import {GattValue} from '../types/ble';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  description?: string;
  value?: GattValue;
  onSave: (value: GattValue) => Promise<void>;
}

const EditDialog = (props: Props) => {
  const {visible, onDismiss, description, value, onSave} = props;

  const [editedValue, setEditedValue] = useState<GattValue>();

  const handleSave = async () => {
    if (editedValue === undefined) {
      return;
    }

    await onSave(editedValue);
    setEditedValue(undefined);
  };

  const handleDismiss = () => {
    setEditedValue(undefined);
    onDismiss();
  };

  return (
    <Dialog visible={visible} onDismiss={handleDismiss}>
      <Dialog.Title>{description}</Dialog.Title>
      <Dialog.Content>
        {typeof value === 'number' && (
          <TextInput
            mode="outlined"
            value={
              editedValue === undefined
                ? value.toString()
                : editedValue.toString()
            }
            onChangeText={setEditedValue}
            keyboardType="decimal-pad"
            autoFocus
          />
        )}
        {typeof value === 'string' && (
          <TextInput
            mode="outlined"
            value={editedValue === undefined ? value : editedValue.toString()}
            onChangeText={setEditedValue}
            autoFocus
          />
        )}
        {typeof value === 'boolean' && (
          <Switch
            value={editedValue === undefined ? !!value : !!editedValue}
            onValueChange={setEditedValue}
          />
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={handleDismiss}>Close</Button>
        {editedValue !== undefined && (
          <Button onPress={handleSave}>Save</Button>
        )}
      </Dialog.Actions>
    </Dialog>
  );
};

export default EditDialog;
