import {animateProgressDelay} from '../../helpers/animate';
import {bezierEasing} from '../../helpers/cubic-bezier';
import AbstractThing from './abstract-thing';


export default class Saturn extends AbstractThing {
  constructor(ctx, windowWidth, windowHeight) {
    super(ctx, windowWidth, windowHeight);

    this._width = 119;
    this._height = 76;
    this._left = this._windowHalfWidth - this._width / 2;
    this._top = this._windowHalfHeight - this._height / 2;
    this._path = `img/saturn.png`;
  }

  _animateAllChanges() {
    const animations = [
      animateProgressDelay(this._getTranslateXFrame(this._left, this._left + 273), 1000, 500, bezierEasing(0.42, 0, 1, 1)),
      animateProgressDelay(this._getTranslateYFrame(this._top, this._top + 202), 1000, 500, bezierEasing(0.42, 0, 1, 1)),
      animateProgressDelay(this._getScaleFrame(0, 1), 1000, 500, bezierEasing(0.42, 0, 1, 1)),
      animateProgressDelay(
          this._getTranslateYFrame(this._top + 202, this._windowHeight + 10), 500, 1800, bezierEasing(0.42, 0, 1, 1)
      ),
    ];

    return animations;
  }
}
