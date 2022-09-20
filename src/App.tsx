/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, ScrollView} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {Appbar} from 'react-native-paper';
import Overview from './components/Overview';
import Scan from './components/Scan';
import {usePeripheral} from './context/usePeripheral';

BleManager.enableBluetooth();

BleManager.start({showAlert: false}).then(() => {
  console.log('Module initialized');
});

const App = () => {
  const {peripheral} = usePeripheral();

  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Content title="esp32" />
      </Appbar.Header>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {!peripheral ? <Scan /> : <Overview />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
