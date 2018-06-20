const { createDelayedPromise, createFailedDelayedPromise, timed } = require('./common');
const pact = require('../');


describe('pact', () => {

  it('should resolve to empy array when empy array of tasks', (done) => {
    pact([]).then((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('should process tasks in batches by concurrency', (done) => {
    const tasks = ['a', 'b', 'c', 'd', 'e'].map(id => () => createDelayedPromise(id, 100));
    const timedPact = timed(pact);

    Promise.all(
      [undefined, 1, 2, 3, 4, 5, 10]
        .map(concurrency => timedPact(tasks, concurrency)),
    ).then((results) => {
      expect(results.map(result => [result[0], Math.round(result[1] / 100)]))
        .toMatchSnapshot();
      done();
    });
  });

  it('should not throttle when interval is not specified', (done) => {
    const tasks = ['a', 'b', 'c', 'd', 'e'].map(id => () => createDelayedPromise(id, 100));
    const timedPact = timed(pact);

    Promise.all(
      [undefined, 1, 2, 3, 4, 5, 10]
        .map(concurrency => timedPact(tasks, concurrency)),
    ).then((results) => {
      expect(results.map(result => [result[0], Math.round(result[1] / 100)]))
        .toMatchSnapshot();
      done();
    });
  });

  it('should throttle batches by given interval', (done) => {
    const tasks = ['a', 'b', 'c', 'd', 'e'].map(id => () => createDelayedPromise(id, 100));
    const timedPact = timed(pact);

    Promise.all(
      [undefined, 1, 2, 3, 4, 5, 10]
        .map(concurrency => timedPact(tasks, concurrency, 100)),
    ).then((results) => {
      expect(results.map(result => [result[0], Math.round(result[1] / 100)]))
        .toMatchSnapshot();
      done();
    });
  });

  it('should bail out when failFast is true', (done) => {
    const tasks = [
      () => createDelayedPromise('xxx', 100),
      () => createFailedDelayedPromise('some error!', 100),
      () => createDelayedPromise('zzz', 100),
    ];
    pact(tasks).catch((err) => {
      expect(err.message).toBe('Error: some error!');
      done();
    });
  });

  it('should NOT bail out when failFast is false', (done) => {
    const tasks = [
      () => createDelayedPromise('xxx', 10),
      () => createFailedDelayedPromise('some error!', 10),
      () => createDelayedPromise('zzz', 10),
      () => createFailedDelayedPromise(new TypeError('Foo...'), 10),
    ];
    pact(tasks, 1, 0, false).then((results) => {
      expect(typeof results[0]).toBe('string');
      expect(results[1] instanceof Error).toBe(true);
      expect(typeof results[2]).toBe('string');
      expect(results[3] instanceof TypeError).toBe(true);

      expect(results[0]).toBe('xxx');
      expect(results[1].message).toBe('Error: some error!');
      expect(results[2]).toBe('zzz');
      expect(results[3].message).toBe('Foo...');

      done();
    });
  });

});
