// WARNING ONLY NODE???
const { Readable } = require('stream');
const splitArrayIntoBatches = require('./splitArrayIntoBatches');


module.exports = (tasks, concurrency = 1, interval = 0, failFast = true) => {
  const stream = new Readable({
    objectMode: true,
    read() { },
  });

  let hasErrored = false;
  const error = (err) => {
    hasErrored = true;
    stream.emit('error', err);
  };

  const push = chunk => (!hasErrored && stream.readable && stream.push(chunk));

  const processBatches = (batches, batchIdx = 0) => {
    if (!batches.length) {
      return push(null);
    }

    const wrap = (task, batchTaskIdx) => {
      const idx = (batchIdx * concurrency) + batchTaskIdx;
      return task()
        .then(result => push({ idx, result }))
        .catch(err => (
          (failFast)
            ? error(Object.assign(err, { idx }))
            : push({ idx, result: err })
        ));
    };

    return Promise.all(batches[0].map(wrap)).then(() => {
      if (batches.length <= 1) {
        return push(null);
      }
      return setTimeout(
        () => (!hasErrored && stream.readable && processBatches(batches.slice(1), batchIdx + 1)),
        interval,
      );
    });
  };

  processBatches(splitArrayIntoBatches(tasks, concurrency));

  return stream;
};
