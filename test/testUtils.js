exports.createDelayedPromise = (val, delay) => new Promise(
  resolve => setTimeout(() => resolve(val), delay),
);


exports.createFailedDelayedPromise = (err, delay) => new Promise(
  (resolve, reject) => setTimeout(
    () => reject((err instanceof Error) ? err : new Error(`Error: ${err}`)),
    delay,
  ),
);


exports.timed = (fn, start = Date.now()) => (...args) => fn(...args)
  .then(results => [results, Date.now() - start]);
