module.exports = (arr, limit) => arr.reduce((memo, item) => {
  if (memo.length && memo[memo.length - 1].length < limit) {
    memo[memo.length - 1].push(item);
    return memo;
  }
  return [...memo, [item]];
}, []);
