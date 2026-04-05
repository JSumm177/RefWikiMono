/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
  });
});
