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

  it('should process tasks in series and emit results as data events', (done) => {
    const results = [];
    createStream([
      () => createDelayedPromise('xxx', 20),
      () => createDelayedPromise('yyy', 10),
    ])
      .on('data', result => results.push(result))
      .on('end', () => {
        expect(results).toEqual(['xxx', 'yyy']);
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
        expect(onData.mock.calls[0][0] instanceof Error).toBe(true);
        expect(onData.mock.calls[1][0]).toBe('yyy');
        expect(onData.mock.calls[2][0] instanceof Error).toBe(true);
        done();
      });
  });
});
