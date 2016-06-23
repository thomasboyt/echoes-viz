import _ from 'lodash';

import {
  speed,
  spawnMs,
  accelFactor,
  originMoveSpeed,
  initRadius,
  interpSpeed,
  rotateSpeed,

  lineWidth,
  width,
  height,
} from './constants';

import transitions from './transitions';

const maxRadius = Math.sqrt(width * width + height * height) + lineWidth;

export interface Layer {
  radius: number;
  angle: number;
}

interface StateOpts {
  initialTransitionIndex?: number;
}

export default class State {
  layers: Layer[];
  private lastSpawn: number;

  interp: number;

  private transitionIdx: number;

  constructor(opts: StateOpts) {
    this.lastSpawn = 0;
    this.layers = [];

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
