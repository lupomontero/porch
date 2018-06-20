const splitArrayIntoBatches = (arr, limit) => arr.reduce((memo, item) => {
  if (memo.length && memo[memo.length - 1].length < limit) {
    memo[memo.length - 1].push(item);
    return memo;
  }
  return [...memo, [item]];
}, []);


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
