import { describe, it, expect } from 'vitest';
import {
  createDelayedPromise,
  createFailedDelayedPromise,
  timed,
} from './testUtils.js';
import porch from '../index.js';

describe('porch', () => {
  it('should resolve to empy array when empy array of tasks', async () => {
    const results = await porch([]);
    expect(results).toEqual([]);
  });

  it('should process tasks in batches by concurrency', async () => {
    const tasks = ['a', 'b', 'c', 'd', 'e'].map(id => () => createDelayedPromise(id, 100));
    const timedPorch = timed(porch);

    const results = await Promise.all(
      [undefined, 1, 2, 3, 4, 5, 10]
        .map(concurrency => timedPorch(tasks, concurrency)),
    );

    expect(results.map(result => [result[0], Math.round(result[1] / 100)]))
      .toMatchSnapshot();
  });

  it('should not throttle when interval is not specified', async () => {
    const tasks = ['a', 'b', 'c', 'd', 'e'].map(id => () => createDelayedPromise(id, 100));
    const timedPorch = timed(porch);

    const results = await Promise.all(
      [undefined, 1, 2, 3, 4, 5, 10]
        .map(concurrency => timedPorch(tasks, concurrency)),
    );

    expect(results.map(result => [result[0], Math.round(result[1] / 100)]))
      .toMatchSnapshot();
  });

  it('should throttle batches by given interval', async () => {
    const tasks = ['a', 'b', 'c', 'd', 'e'].map(id => () => createDelayedPromise(id, 100));
    const timedPorch = timed(porch);

    const results = await Promise.all(
      [undefined, 1, 2, 3, 4, 5, 10]
        .map(concurrency => timedPorch(tasks, concurrency, 100)),
    );

    expect(results.map(result => [result[0], Math.round(result[1] / 100)]))
      .toMatchSnapshot();
  });

  it('should bail out when failFast is true', async () => {
    const tasks = [
      () => createDelayedPromise('xxx', 100),
      () => createFailedDelayedPromise('some error!', 100),
      () => createDelayedPromise('zzz', 100),
    ];

    return porch(tasks).catch((err) => {
      expect(err.message).toBe('Error: some error!');
    });
  });

  it('should NOT bail out when failFast is false', async () => {
    const tasks = [
      () => createDelayedPromise('xxx', 10),
      () => createFailedDelayedPromise('some error!', 10),
      () => createDelayedPromise('zzz', 10),
      () => createFailedDelayedPromise(new TypeError('Foo...'), 10),
    ];

    const results = await porch(tasks, 1, 0, false);

    expect(typeof results[0]).toBe('string');
    expect(results[1] instanceof Error).toBe(true);
    expect(typeof results[2]).toBe('string');
    expect(results[3] instanceof TypeError).toBe(true);

    expect(results[0]).toBe('xxx');
    expect(results[1].message).toBe('Error: some error!');
    expect(results[2]).toBe('zzz');
    expect(results[3].message).toBe('Foo...');
  });
});
