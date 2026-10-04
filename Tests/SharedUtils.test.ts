import assert from 'node:assert/strict';
import test from 'node:test';
import { clamp, clamp01, positiveModulo, toSigned, toUnsigned, formatRadix, formatNumberInput } from '../src/Shared/Utils/Numbers';
import { hsvToRgb, rgbToHsv, hexToRgb, rgbToHex, colorDataFromHSV } from '../src/Shared/Utils/Colors';
import { collectCommandAliases, normalizeLocaleChain, normalizeMnemonicToken } from '../src/Shared/Utils/CommandMnemonics';
import { getStorageItem, setStorageItem } from '../src/Shared/Utils/Storage';
import { cloneJson } from '../src/Shared/Utils/Json';
import { generateId } from '../src/Shared/Utils/Identifiers';
import { sleep } from '../src/Shared/Utils/Async';

test('word conversion agrees for negative, wrapped and maximum-width machine values', () => {
  for (const bits of [1, 4, 10, 16, 30]) {
    const modulus = 2 ** bits;
    assert.equal(toUnsigned(-1, bits), modulus - 1);
    assert.equal(toSigned(modulus - 1, bits), -1);
    assert.equal(toSigned(modulus / 2, bits), -modulus / 2);
    assert.equal(toSigned(modulus * 3 + 1, bits), bits === 1 ? -1 : 1);
    assert.equal(toUnsigned(-modulus, bits), 0);
  }
  assert.equal(positiveModulo(-9007199254740993123456n, 1024n), 896n);
});

test('input formatting keeps rounding and prefixes separate from register display', () => {
  assert.equal(formatNumberInput(255.5, 'hex'), 'FF');
  assert.equal(formatRadix(255.5, 'hex'), '0xFF.8');
  assert.equal(formatRadix(10, 'bin'), '0b1010');
  assert.equal(formatNumberInput(-1.5, 'bin'), '-10');
  assert.equal(formatNumberInput(1.5, 'dec'), '1.5');
  assert.equal(formatNumberInput(NaN, 'hex'), '');
  assert.equal(formatNumberInput('255', 'hex'), '');
  assert.equal(formatRadix(Infinity, 'bin'), '0bInfinity');
});

test('clamping preserves general NaN behavior and the color brightness fallback', () => {
  assert.equal(clamp(-1, 0, 10), 0);
  assert.equal(clamp(11, 0, 10), 10);
  assert.equal(clamp(5, 0, 10), 5);
  assert.ok(Number.isNaN(clamp(NaN, 0, 10)));
  assert.equal(clamp01(NaN), 0);
  assert.equal(clamp01(Infinity), 0);
  assert.equal(clamp01(1.5), 1);
});

test('color conversions retain primary colors, grayscale and invalid input handling', () => {
  for (const [hue, hex] of [
    [0, '#ff0000'],
    [60, '#ffff00'],
    [120, '#00ff00'],
    [180, '#00ffff'],
    [240, '#0000ff'],
    [300, '#ff00ff'],
  ] as const) {
    const rgb = hsvToRgb(hue, 1, 1);
    assert.equal(rgbToHex(rgb), hex);
    assert.deepEqual(hexToRgb(hex.toUpperCase()), rgb);
    assert.deepEqual(rgbToHsv(rgb.r, rgb.g, rgb.b), { h: hue, s: 1, v: 1 });
  }
  assert.deepEqual(rgbToHsv(0, 0, 0), { h: 0, s: 0, v: 0 });
  assert.deepEqual(rgbToHsv(128, 128, 128), { h: 0, s: 0, v: 128 / 255 });
  assert.equal(hexToRgb('#fff'), null);
  assert.equal(hexToRgb('invalid'), null);
});

test('saved LED data preserves the base color independently of brightness', () => {
  const saved = colorDataFromHSV({ h: 0, s: 1, v: 1 }, 0.5);
  assert.equal(saved.hex, '#800000');
  assert.deepEqual(saved.baseRgb, { r: 255, g: 0, b: 0 });
  const reopened = hexToRgb(rgbToHex(saved.baseRgb))!;
  const restored = colorDataFromHSV(rgbToHsv(reopened.r, reopened.g, reopened.b), saved.brightness);
  assert.deepEqual(restored, saved);
  assert.equal(colorDataFromHSV(saved.hsv, 0).hex, '#000000');
});

test('command aliases retain regional fallback order and case-insensitive deduplication', () => {
  assert.deepEqual(normalizeLocaleChain(' EN_us '), ['en-us', 'en']);
  assert.equal(normalizeMnemonicToken(' TestCMD ', 'lower'), 'testcmd');
  assert.equal(normalizeMnemonicToken(null), '');
  const aliases = collectCommandAliases(
    {
      name: ' dod ',
      mnemonics: { en: ['add', 'ADD', 'dod'], en_US: 'plus', default: 'sum' },
    },
    { locale: 'en-US' }
  );
  assert.equal(aliases.canonical, 'DOD');
  assert.deepEqual(aliases.preferred, ['PLUS', 'ADD', 'SUM']);
  assert.deepEqual(aliases.all, ['DOD', 'ADD', 'PLUS', 'SUM']);
});

test('storage handles absent or blocked browser globals, empty values and removals', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  Reflect.deleteProperty(globalThis, 'localStorage');
  assert.equal(getStorageItem('missing', 'fallback'), 'fallback');
  assert.equal(setStorageItem('key', 'value'), false);

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Storage blocked');
    },
  });
  assert.equal(getStorageItem('missing'), null);
  assert.equal(setStorageItem('key', null), false);

  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });
  assert.equal(setStorageItem('key', ''), true);
  assert.equal(getStorageItem('key', 'fallback'), '');
  assert.equal(setStorageItem('key', null), true);
  assert.equal(getStorageItem('key', 'fallback'), 'fallback');

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      setItem() {
        throw new Error('Quota exceeded');
      },
    },
  });
  assert.equal(setStorageItem('key', 'value'), false);
});

test('JSON cloning detaches nested command data without rejecting observable proxies', () => {
  const original = [{ name: 'DOD', description: { en: 'Add' }, omitted: undefined }];
  const copy = cloneJson(new Proxy(original, {}));
  copy[0].description.en = 'Changed';
  assert.equal(original[0].description.en, 'Add');
  assert.equal(Object.hasOwn(copy[0], 'omitted'), false);
});

test('identifiers preserve prefixes with and without crypto UUID support', (context) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    else Reflect.deleteProperty(globalThis, 'crypto');
  });
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { randomUUID: () => 'fixed-uuid' } });
  assert.equal(generateId('session'), 'session-fixed-uuid');
  Reflect.deleteProperty(globalThis, 'crypto');
  assert.match(generateId(), /^msg-[a-z0-9]+$/);
});

test('zero-delay sleep yields to the event loop during fast machine execution', async () => {
  let timerRan = false;
  setTimeout(() => {
    timerRan = true;
  }, 0);
  await sleep(0);
  assert.equal(timerRan, true);
});
