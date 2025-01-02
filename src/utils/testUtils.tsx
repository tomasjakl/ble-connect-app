import React, {
  render,
  renderHook,
  RenderHookOptions,
  RenderOptions,
} from '@testing-library/react-native';
import {PropsWithChildren, ReactElement} from 'react';
import {PaperProvider} from 'react-native-paper';
import {PeripheralProvider} from '../context/usePeripheral';

const wrapper = ({children}: PropsWithChildren) => {
  return (
    <PaperProvider>
      <PeripheralProvider>{children}</PeripheralProvider>
    </PaperProvider>
  );
};

const customRender = <T,>(
  component: ReactElement<T>,
  options?: RenderOptions,
) => render(component, {wrapper, ...options});

const customRenderHook = <Result, Props>(
  hookToRender: (props: Props) => Result,
  options?: RenderHookOptions<Props>,
) => renderHook(hookToRender, {wrapper, ...options});

export * from '@testing-library/react-native';

export {customRender as render, customRenderHook as renderHook};
