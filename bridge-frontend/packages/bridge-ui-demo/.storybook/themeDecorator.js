// themeDecorator.js
import React from 'react';
import { bridgeTheme, ThemeProvider } from '@bridge-ui/core';

const ThemeDecorator = Story => (
  <ThemeProvider theme={bridgeTheme}>{<Story />}</ThemeProvider>
);

export default ThemeDecorator;
