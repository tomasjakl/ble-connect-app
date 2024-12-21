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
import {Appbar} from 'react-native-paper';
import Overview from './components/Overview';
import Scan from './components/Scan';
import {usePeripheral} from './context/usePeripheral';

const App = () => {
  const {peripheral} = usePeripheral();

  return (
    <SafeAreaView>
      <Appbar.Header>
        {!!peripheral && (
          <Appbar.BackAction onPress={() => peripheral.cancelConnection()} />
        )}
        <Appbar.Content title="esp32" />
      </Appbar.Header>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {peripheral ? <Overview /> : <Scan />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
