// WARNING ONLY NODE???
const { Readable } = require('stream');
const splitArrayIntoBatches = require('./splitArrayIntoBatches');


module.exports = (tasks, concurrency, interval = 0, failFast = true) => {
  const stream = new Readable({
    objectMode: true,
    read() {},
  });

  let hasErrored = false;
  const error = (err) => {
    hasErrored = true;
    stream.emit('error', err);
  };

  const push = chunk => (!hasErrored && stream.readable && stream.push(chunk));

  const processBatches = (batches) => {
    if (!batches.length) {
      return push(null);
    }

    const wrap = fn => fn()
      .then(result => push(result))
      .catch(err => (failFast ? error(err) : push(err)));

    return Promise.all(batches[0].map(wrap)).then(() => setTimeout(
      () => (!hasErrored && stream.readable && processBatches(batches.slice(1))),
      interval,
    ));
  };

  processBatches(splitArrayIntoBatches(tasks, concurrency));

  return stream;
};
