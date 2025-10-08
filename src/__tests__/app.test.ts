import { describe, it, expect } from 'vitest';

describe('Application', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    expect('VATSIM'.toLowerCase()).toBe('vatsim');
  });
});
