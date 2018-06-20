# Pact

Process **promise-based** tasks in **series** and **parallel**, controlling
**concurrency** and **throttling**.

[![Build Status](https://travis-ci.com/lupomontero/pact.svg?branch=master)](https://travis-ci.com/lupomontero/pact)
[![Coverage Status](https://coveralls.io/repos/lupomontero/pact/badge.svg?branch=master)](https://coveralls.io/r/lupomontero/pact?branch=master)

## Installation

```sh
npm install lupomontero/pact
```

## Usage / API

### `Promise pact(tasks, concurrency, interval, failFast)`

#### Arguments

* `tasks` (`Array`): An array of `tasks`, where each _task_ is a function that
  expects no arguments and will return a `Promise`.
* `concurrency` (`Number`): Default: `1`. Maximum number of tasks to run
  concurrently (in parallel).
* `interval` (`Number`): Default: `0`. Interval between each _batch_ of
  concurrent _tasks_.
* `failFast` (`Boolean`): Default: `true`. Whether to bail out when one of the
  promises fails. If set to `false` errors will be included in the results
  passed to `then()` instead of being passed independently via the `catch()`
  method.

#### Return value

A `Promise` that will resolve to an array with the results for each _task_.
Results will be in the same order as in the input _tasks_ array.

<!--
### `EventEmitter pact.emitter(tasks, concurrency, interval, failFast)`

#### Arguments

#### Return value

### `Stream pact.stream(tasks, concurrency, interval, failFast, streamOtions)`

#### Arguments

#### Return value
-->

## Examples

## Series

Process each task after the other, sequentially. Each task will wait for the
previous one to complete. Concurrency set to `1` (one task at a time).

```js
const pact = require('pact');
const tasks = users.map(user => () => auth.deleteUser(user.localId);

pact(tasks)
  .then(console.log)
  .catch(console.error);
```

## Batches

Process _tasks_ in _batches_ based on a given _concurrency_. In this example
_tasks_ will be processed in batches of 5 _tasks_ each. Each batch waits for the
previous one to complete and then performs its tasks in parallel.

```js
pact(tasks, 5)
  .then(console.log)
  .catch(console.error);
```

## Throttled

Same as example above but adding a 1000ms delay between batches.

```js
pact(tasks, 5, 1000)
  .then(console.log)
  .catch(console.error);
```

## failFast=false (don't bail out on errors)

Same as above, but in this case if a promise fails, processing will continue
instead of stopping the whole thing. When `failFast` is set to `false`, errors
will appear as the value/result for the relevant element in the results array
(failed tasks/promises won't end up in the `catch()` method).

```js
pact(tasks, 5, 1000, false)
  .then(console.log)
  .catch(console.error);
```

<!--
## EventEmitter

```js
const { emitter } = require('pact');

emitter(tasks, 5, 1000, false)
  .on('error', err => console.error('error', err))
  .on('data', data => console.log('data', data))
  .on('log', (level, message) => console[level](`${level}: ${message}`))
  .on('end', _ => console.log('ended!'));
```

## Stream

```js
const { stream } = require('pact');

stream(tasks, 5, 1000, false, { objectMode: true })
  .on('error', err => console.error('error', err))
  .on('data', data => console.log('data', data))
  .on('end', _ => console.log('ended!'));


stream(tasks, 5, 1000, false).pipe(process.stdout);
```
-->
