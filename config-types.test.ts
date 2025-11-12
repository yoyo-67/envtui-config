import { describe, it, expect } from 'vitest';
import { parseVariableMapping, resolveOptionValue } from './config-types';

describe('parseVariableMapping', () => {
  it('should parse simple string variable', () => {
    const result = parseVariableMapping('HOST_DOMAIN');

    expect(result).toEqual({
      name: 'HOST_DOMAIN',
      formatter: undefined,
    });
  });

  it('should parse variable mapping with formatter', () => {
    const result = parseVariableMapping({
      name: 'TRPC_BACKEND',
      formatter: 'http://{value}:4000',
    });

    expect(result.name).toBe('TRPC_BACKEND');
    expect(result.formatter).toBeDefined();
    expect(result.formatter!('localhost')).toBe('http://localhost:4000');
  });

  it('should parse variable mapping without formatter', () => {
    const result = parseVariableMapping({
      name: 'BASE_HOST',
    });

    expect(result).toEqual({
      name: 'BASE_HOST',
      formatter: undefined,
    });
  });

  it('formatter should handle multiple {value} tokens', () => {
    const result = parseVariableMapping({
      name: 'CUSTOM_VAR',
      formatter: 'prefix-{value}-suffix-{value}',
    });

    expect(result.formatter!('test')).toBe('prefix-test-suffix-{value}');
  });
});

describe('resolveOptionValue', () => {
  it('should resolve {LOCAL_IP} token with provided IP', () => {
    const context = { localIP: '192.168.1.100' };
    const result = resolveOptionValue('{LOCAL_IP}', context);

    expect(result).toBe('192.168.1.100');
  });

  it('should fallback to localhost when local IP is null', () => {
    const context = { localIP: null };
    const result = resolveOptionValue('{LOCAL_IP}', context);

    expect(result).toBe('localhost');
  });

  it('should return value as-is for non-token values', () => {
    const context = { localIP: '192.168.1.100' };
    const result = resolveOptionValue('proxyman.debug', context);

    expect(result).toBe('proxyman.debug');
  });

  it('should handle regular domain values', () => {
    const context = { localIP: '192.168.1.100' };
    const result = resolveOptionValue('yohai.nxenv.com', context);

    expect(result).toBe('yohai.nxenv.com');
  });
});
