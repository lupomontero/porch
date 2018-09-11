describe('pact (basic - no streams)', () => {
  beforeAll(() => {
    process.env.PACT_NO_STREAMS = true;
  });

  afterAll(() => {
    process.env.PACT_NO_STREAMS = undefined;
    // done();
  });

  it('should be a function and NOT have `createStream`', () => {
    // eslint-disable-next-line global-require
    const pact = require('../');
    expect(typeof pact).toBe('function');
    expect(pact.createStream).toBe(undefined);
  });
});
