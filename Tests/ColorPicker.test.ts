import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateWheelSelection } from '../src/Components/Settings/ColorPicker/Helpers/ColorWheel';

test('color wheel maps its center and cardinal directions to hue and saturation', () => {
  assert.equal(calculateWheelSelection(100, 100, 200, 200).s, 0);
  assert.deepEqual(calculateWheelSelection(200, 100, 200, 200), { h: 0, s: 1 });
  assert.deepEqual(calculateWheelSelection(100, 200, 200, 200), { h: 90, s: 1 });
  assert.deepEqual(calculateWheelSelection(0, 100, 200, 200), { h: 180, s: 1 });
  assert.deepEqual(calculateWheelSelection(100, 0, 200, 200), { h: 270, s: 1 });
});

test('color wheel preserves normalized pointer position when the displayed size changes', () => {
  assert.deepEqual(calculateWheelSelection(150, 100, 200, 200), calculateWheelSelection(300, 150, 400, 300));
  assert.equal(calculateWheelSelection(400, 400, 200, 200).s, 1);
});
