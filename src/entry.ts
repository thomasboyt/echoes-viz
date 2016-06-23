require('babel-polyfill');
import _ from 'lodash';

// 16:9
const width = 800;
const height = 450;

const canvas = document.querySelector('#canvas') as HTMLCanvasElement;
canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext('2d');

interface Layer {
  radius: number;
}

const lineWidth = 5;
const halfW = width / 2;
const halfH = height / 2;
const maxRadius = Math.sqrt(halfW * halfW + halfH * halfH) + lineWidth;

// TODO: Add control panel to change these
const speed = 60 / 1000;
const spawnMs = 400;
const accelFactor = 20 / 1000;
const originMoveSpeed = 30 / 1000;
const initRadius = 30;
const interpSpeed = 1 / 1000;

class State {
  layers: Layer[];
  private lastSpawn: number;

  origin: number[];
  interp: number;
  private interpDir: number;

  constructor() {
    this.lastSpawn = 0;
    this.layers = [];

    this.origin = [width / 2, height / 2];
    this.interp = 0;
    this.interpDir = 1;
  }

  private addLayer() {
    this.layers.push({
      radius: initRadius,
    });
  }

  update(dt: number, now: number) {
    this.interp += dt * interpSpeed * this.interpDir;

    if (this.interp > 1) {
      this.interp = 1;
      this.interpDir = -1;
    } else if (this.interp < 0) {
      this.interp = 0;
      this.interpDir = 1;
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

      return {radius};
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

function drawCircle(ctx: CanvasRenderingContext2D) {
  ctx.arc(0, 0, initRadius, 0, 2 * Math.PI);
}

function drawHexagon(ctx: CanvasRenderingContext2D, interp: number) {
  const r = initRadius;

  const points = _.range(0, 7).map((n) => {
    return [
      Math.round(r * Math.cos(2 * Math.PI * n/6)),
      Math.round(r * Math.sin(2 * Math.PI * n/6)),
    ]
  });

  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i += 1) {
    const cur = points[i];
    const next = points[i + 1];
    const xc = (cur[0] + next[0]) / 2;
    const yc = (cur[1] + next[1]) / 2;

    // INTERPOLATE FROM xc to cur[0] and xy to cur[1]
    const ix = cur[0] + (xc - cur[0]) * interp;
    const iy = cur[1] + (yc - cur[1]) * interp;

    ctx.quadraticCurveTo(cur[0], cur[1], ix, iy);
  }

  const last = points[points.length - 1];
  ctx.quadraticCurveTo(last[0], last[1], points[0][0], points[0][1]);
}

function render(ctx: CanvasRenderingContext2D, state: State) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = lineWidth;

  ctx.save();

  ctx.translate(state.origin[0], state.origin[1]);

  renderShape(ctx, (ctx) => drawHexagon(ctx, state.interp), 1);

  state.layers.forEach((layer: Layer) => {
    renderShape(ctx, (ctx) => drawHexagon(ctx, state.interp), layer.radius / initRadius);
  });

  ctx.restore();
}

let time = Date.now();
const state = new State();
function runLoop() {
  const now = Date.now();
  const dt = now - time;
  time = now;

  state.update(dt, now);
  render(ctx, state);

  window.requestAnimationFrame(runLoop);
}

window.requestAnimationFrame(runLoop);