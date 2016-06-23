import {
  hexagonToCircle,
  hexagonToRectangle,
} from './render';

export type TransitionFn = (ctx: CanvasRenderingContext2D, interp: number) => void;

// Flips the direction of "interp" value
function reverseTransition(fn: TransitionFn) {
  return function(ctx: CanvasRenderingContext2D, interp: number) {
    return fn(ctx, 1 - interp);
  };
}

export default [
  hexagonToRectangle,
  reverseTransition(hexagonToRectangle),
  hexagonToCircle,
  reverseTransition(hexagonToCircle),
];
