import React from 'react';
import {ScrollView} from 'react-native';
import {Appbar, PaperProvider} from 'react-native-paper';
import Overview from './components/Overview';
import Scan from './components/Scan';
import {usePeripheral} from './context/usePeripheral';

const App = () => {
  const {peripheral} = usePeripheral();

  return (
    <PaperProvider>
      <Appbar.Header>
        {!!peripheral && (
          <Appbar.BackAction onPress={() => peripheral.cancelConnection()} />
        )}
        <Appbar.Content title={peripheral?.name ?? 'Devices'} />
      </Appbar.Header>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {peripheral ? <Overview /> : <Scan />}
      </ScrollView>
    </PaperProvider>
  );
};

export default App;
