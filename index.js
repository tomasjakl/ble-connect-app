/**
 * @format
 */

import {AppRegistry} from 'react-native';
import React from 'react';
import App from './src/App';
import {Provider as PaperProvider} from 'react-native-paper';
import {name as appName} from './app.json';
import {PeripheralProvider} from './src/context/usePeripheral';

function Main() {
  return (
    <PaperProvider>
      <PeripheralProvider>
        <App />
      </PeripheralProvider>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
