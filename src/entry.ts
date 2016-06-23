require('babel-polyfill');
import _ from 'lodash';

import qs from 'query-string';

import {
  speed,
  spawnMs,
  accelFactor,
  originMoveSpeed,
  initRadius,
  interpSpeed,
  rotateSpeed,
} from './constants';

import {
  hexagonToCircle,
  hexagonToRectangle,
} from './render';

// 16:9
const width = 800;
const height = 450;

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

interface Layer {
  radius: number;
  angle: number;
}

const lineWidth = 5;
const halfW = width / 2;
const halfH = height / 2;
const maxRadius = Math.sqrt(halfW * halfW + halfH * halfH) + lineWidth;

type TransitionFn = (ctx: CanvasRenderingContext2D, interp: number) => void;

// Flips the direction of "interp" value
function reverseTransition(fn: TransitionFn) {
  return function(ctx: CanvasRenderingContext2D, interp: number) {
    return fn(ctx, 1 - interp);
  };
}

const transitions = [
  hexagonToRectangle,
  reverseTransition(hexagonToRectangle),
  hexagonToCircle,
  reverseTransition(hexagonToCircle),
];

interface StateOpts {
  initialTransitionIndex?: number;
}

class State {
  layers: Layer[];
  private lastSpawn: number;

  origin: number[];
  interp: number;

  private transitionIdx: number;

  constructor(opts: StateOpts) {
    this.lastSpawn = 0;
    this.layers = [];

    this.origin = [width / 2, height / 2];

    this.interp = 0;
    this.transitionIdx = opts.initialTransitionIndex || 0;
  }

  getTransitionFn() {
    return transitions[this.transitionIdx];
  }

  private addLayer() {
    this.layers.push({
      radius: initRadius,
      angle: 0,
    });
  }

  private nextTransition() {
    this.interp = 0;

    this.transitionIdx = this.transitionIdx + 1;

    if (this.transitionIdx > transitions.length - 1) {
      this.transitionIdx = 0;
    }
  }

  update(dt: number, now: number) {
    this.interp += dt * interpSpeed;

    if (this.interp > 1) {
      this.nextTransition();
    }

    if (now > this.lastSpawn + spawnMs) {
      this.lastSpawn = now;

      this.addLayer();
    }

    let idxsToSweep = [];

    this.layers = this.layers.map((layer, idx) => {
      const accel = layer.radius * accelFactor;

      const radius =  layer.radius + dt * speed * accel;

      if (radius > maxRadius) {
        idxsToSweep.push(idx);
      }

      return {
        radius,
        angle: layer.angle + dt * rotateSpeed,
      };
    });

    _.pullAt(this.layers, idxsToSweep);
  }
}

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

  ctx.translate(state.origin[0], state.origin[1]);

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