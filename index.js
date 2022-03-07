import splitArrayIntoBatches from './lib/splitArrayIntoBatches.js';

export { default as createStream } from './lib/createStream.js';

export const createPromise = (
  tasks,
  concurrency,
  interval = 0,
  failFast = true,
) => {
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

export default createPromise;
