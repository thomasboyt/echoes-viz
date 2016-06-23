require('babel-polyfill');

import qs from 'query-string';

import {
  speed,
  spawnMs,
  accelFactor,
  originMoveSpeed,
  initRadius,
  interpSpeed,
  rotateSpeed,
  width,
  height,
  lineWidth,
} from './constants';

import State, {Layer} from './State';

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

/*
 * Changing shapes
 * 1. start with polygon of w/e shape (octagon?)
 * 2. draw shape!
 * 3. apply scaling transformation
 *
 * eventually: apply transformation starting from innermost shape to outermost shape
 */

function renderShape(
  ctx: CanvasRenderingContext2D,
  drawShape: (ctx: CanvasRenderingContext2D) => void,
  scale: number) {

  ctx.save();

  ctx.scale(scale, scale);

  ctx.beginPath();
  drawShape(ctx);
  ctx.closePath();

  ctx.restore();

  ctx.stroke();
}

function render(ctx: CanvasRenderingContext2D, state: State) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = lineWidth;

  ctx.save();

  ctx.translate(width / 2, height / 2);

  const transitionFn = (ctx) => state.getTransitionFn()(ctx, state.interp);

  renderShape(ctx, transitionFn, 1);

  state.layers.forEach((layer: Layer) => {
    ctx.save();
    ctx.rotate(layer.angle)
    renderShape(ctx, transitionFn, layer.radius / initRadius);
    ctx.restore();
  });

  ctx.restore();
}

const query = qs.parse(location.search);

let time = Date.now();

const state = new State({
  initialTransitionIndex: query.transition ? parseInt(query.transition) : null,
});

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