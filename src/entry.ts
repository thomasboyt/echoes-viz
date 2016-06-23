require('babel-polyfill');

import qs from 'query-string';

import {
  width,
  height,
} from './constants';

import State, {Layer} from './state';
import render from './render';

// Create canvas
const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');

// Parse opts
const query = qs.parse(location.search);

// Create state
const state = new State({
  initialTransitionIndex: query.transition ? parseInt(query.transition) : null,
});

// Run loop
let time = Date.now();
function runLoop() {
  const now = Date.now();
  const dt = now - time;
  time = now;

  state.update(dt, now);
  render(ctx, state);

  if (!query.paused) {
    window.requestAnimationFrame(runLoop);
  }
}

window.requestAnimationFrame(runLoop);
