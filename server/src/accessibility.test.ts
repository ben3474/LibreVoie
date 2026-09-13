import assert from 'node:assert/strict';
import test from 'node:test';
import { confidenceFromExtraInfo, orsOptions } from './accessibility.js';

test('converts centimetres into ORS metres', () => {
  const result = orsOptions({profile:'manual',maxIncline:6,maxKerbCm:3,minWidthCm:90,avoidPoorSurface:true});
  assert.equal(result.profile_params.restrictions.maximum_sloped_kerb, .03);
  assert.equal(result.profile_params.restrictions.minimum_width, .9);
  assert.equal(result.profile_params.restrictions.smoothness_type, 'good');
  assert.deepEqual(result.avoid_features, ['steps']);
});

test('unknown data produces low confidence', () => {
  assert.equal(confidenceFromExtraInfo(undefined).confidence, 'low');
});
