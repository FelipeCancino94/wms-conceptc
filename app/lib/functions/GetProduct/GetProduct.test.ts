import { test, expect } from 'vitest';
import { GetProduct } from './GetProduct';

test('Throw error when the result type is not a string', () => {
  const code = '123';
  expect(GetProduct(code)).toBeTypeOf('string');
})