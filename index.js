const splitArrayIntoBatches = require('./lib/splitArrayIntoBatches');


module.exports = (tasks, concurrency, interval = 0, failFast = true) => {
  const processBatches = (batches, prevResults = []) => {
    if (!batches.length) {
      return Promise.resolve(prevResults);
    }

    return Promise.all(
      batches[0].map(fn => (failFast ? fn() : fn().catch(err => err))),
    ).then((batchResults) => {
      const results = [...prevResults, ...batchResults];
      return (batches.length <= 1)
        ? results
        : new Promise((resolve, reject) => setTimeout(
          () => processBatches(batches.slice(1), results).then(resolve, reject),
          interval,
        ));
    });
  };

  return processBatches(splitArrayIntoBatches(tasks, concurrency));
};


// Exclude `createStream` method in basic build for browsers.
if (!process.env.PACT_NO_STREAMS) {
  // eslint-disable-next-line global-require
  module.exports.createStream = require('./lib/createStream');
}
