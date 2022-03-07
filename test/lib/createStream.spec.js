const { Readable } = require('stream');
const { createDelayedPromise, createFailedDelayedPromise } = require('../testUtils');
const createStream = require('../../lib/createStream');


describe('createStream', () => {
  it('should be a function', () => {
    expect(typeof createStream).toBe('function');
  });

  it('should return a readable stream', () => {
    expect(createStream([]) instanceof Readable).toBe(true);
  });

  it('should end without emitting data when no tasks', (done) => {
    const onData = jest.fn();
    createStream([])
      .on('data', onData)
      .on('end', () => {
        expect(onData).not.toHaveBeenCalled();
        done();
      });
  });

  it('should process tasks in series and emit results as data events', (done) => {
    const results = [];
    createStream([
      () => createDelayedPromise('xxx', 20),
      () => createDelayedPromise('yyy', 10),
    ])
      .on('data', result => results.push(result))
      .on('end', () => {
        expect(results).toEqual([{ idx: 0, result: 'xxx' }, { idx: 1, result: 'yyy' }]);
        done();
      });
  });

  it('should failFast by default', (done) => {
    createStream([
      () => createFailedDelayedPromise('xxx', 10),
      () => createDelayedPromise('yyy', 10),
      () => createFailedDelayedPromise('zzz', 10),
    ])
      .on('error', (err) => {
        expect(err instanceof Error).toBe(true);
        expect(err.message).toBe('Error: xxx');
        expect(err.idx).toBe(0);
        done();
      });
  });

  it('should not bail out when failFast is false', (done) => {
    const onData = jest.fn();
    createStream([
      () => createFailedDelayedPromise('xxx', 10),
      () => createDelayedPromise('yyy', 10),
      () => createFailedDelayedPromise('zzz', 10),
    ], 1, 0, false)
      .on('data', onData)
      .on('end', () => {
        expect(onData.mock.calls.length).toBe(3);
        expect(onData.mock.calls[0].length).toBe(1);
        expect(onData.mock.calls[1].length).toBe(1);
        expect(onData.mock.calls[2].length).toBe(1);
        expect(onData.mock.calls[0][0].idx).toBe(0);
        expect(onData.mock.calls[0][0].result instanceof Error).toBe(true);
        expect(onData.mock.calls[1][0].idx).toBe(1);
        expect(onData.mock.calls[1][0].result).toBe('yyy');
        expect(onData.mock.calls[2][0].idx).toBe(2);
        expect(onData.mock.calls[2][0].result instanceof Error).toBe(true);
        done();
      });
  });

  it('should maintain input indexes in results regardless of arrival time', (done) => {
    const onData = jest.fn();
    createStream([
      () => createDelayedPromise(1, 20),
      () => createDelayedPromise(2, 10),
      () => createDelayedPromise(3, 20),
      () => createDelayedPromise(4, 10),
      () => createDelayedPromise(5, 10),
    ], 2, 0, false)
      .on('data', onData)
      .on('end', () => {
        const results = onData.mock.calls.map(([data]) => data);

        const idxByArrival = results.reduce((memo, data) => [...memo, data.idx], []);
        expect(idxByArrival).toEqual([1, 0, 3, 2, 4]);

        const sortedResults = results.sort((a, b) => {
          if (a.idx > b.idx) {
            return 1;
          }
          if (a.idx < b.idx) {
            return -1;
          }
          return 0;
        });

        const valuesSortedByIdx = sortedResults.map(({ result }) => result);
        expect(valuesSortedByIdx).toEqual([1, 2, 3, 4, 5]);
        done();
      });
  });

  it('should not wait until next empty batch to emit end', (done) => {
    const onData = jest.fn();
    createStream([
      () => createDelayedPromise(1, 10),
    ], 1, 10 * 1000)
      .on('data', onData)
      .on('end', () => {
        expect(onData).toHaveBeenCalledTimes(1);
        expect(onData).toHaveBeenCalledWith({ idx: 0, result: 1 });
        done();
      });
  });
});
