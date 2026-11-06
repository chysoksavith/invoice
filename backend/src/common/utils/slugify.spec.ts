import { describe, it, expect } from 'vitest';
import { slugify } from './slugify.js';

describe('slugify utility', () => {
  it('should convert strings to lowercase hyphenated slugs', () => {
    expect(slugify('Angkor Coffee & Bakery')).toBe('angkor-coffee-bakery');
    expect(slugify('Hello World!')).toBe('hello-world');
  });

  it('should trim leading and trailing spaces and dashes', () => {
    expect(slugify('  --Cambodia Tech Hub--  ')).toBe('cambodia-tech-hub');
  });

  it('should collapse multiple spaces or special characters', () => {
    expect(slugify('Accounting   System   2026')).toBe('accounting-system-2026');
    expect(slugify('Tax & Accounting: Phase 1')).toBe('tax-accounting-phase-1');
  });

  it('should handle empty or null input gracefully', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null as unknown as string)).toBe('');
  });
});
