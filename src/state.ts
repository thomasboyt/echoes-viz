import _ from 'lodash';

import {
  speed,
  spawnMs,
  accelFactor,
  originMoveSpeed,
  initRadius,
  interpSpeed,
  rotateSpeed,
  transitionPauseMs,

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

enum TransitionState {
  InTransition,
  BetweenTransition,
}

export default class State {
  private transitionState: TransitionState;

  layers: Layer[];
  private lastSpawn: number;

  interp: number;
  private nextTransitionAt: number;

  private transitionIdx: number;

  constructor(opts: StateOpts) {
    this.lastSpawn = 0;
    this.layers = [];

    this.interp = 0;
    this.transitionIdx = opts.initialTransitionIndex || 0;

    this.transitionState = TransitionState.InTransition;
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
    this.transitionState = TransitionState.InTransition;

    this.transitionIdx = this.transitionIdx + 1;

    if (this.transitionIdx > transitions.length - 1) {
      this.transitionIdx = 0;
    }
  }

  private exitTransition(now: number) {
    this.transitionState = TransitionState.BetweenTransition;
    this.nextTransitionAt = now + transitionPauseMs;
  }

  update(dt: number, now: number) {
    if (this.transitionState === TransitionState.BetweenTransition && now > this.nextTransitionAt) {
      console.log('next');
      this.nextTransition();
    }

    if (this.transitionState === TransitionState.InTransition) {
      if (this.interp > 1) {
        console.log('exiting transition');
        this.exitTransition(now);
      } else {
        this.interp += dt * interpSpeed;
      }
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
