const d = (o, t) => o.reduce((e, r) => e.length && e[e.length - 1].length < t ? (e[e.length - 1].push(r), e) : [...e, [r]], []);
class j {
  constructor() {
    this.readable = !0, this.listeners = {};
  }
  getListeners(t) {
    return this.listeners[t] || [];
  }
  on(t, e) {
    return Object.assign(this.listeners, {
      [t]: this.getListeners(t).concat(e)
    }), this;
  }
  off(t, e) {
    return Object.assign(this.listeners, {
      [t]: this.getListeners(t).filter((r) => r !== e)
    }), this;
  }
  emit(t, e) {
    setTimeout(() => {
      this.getListeners(t).forEach((r) => r(e));
    });
  }
  push(t) {
    return t === null ? this.emit("end") : this.emit("data", t);
  }
}
const L = (o, t = 1, e = 0, r = !0) => {
  const i = new j({
    objectMode: !0,
    read() {
    }
  });
  let l = !1;
  const a = (s) => {
    l = !0, i.emit("error", s);
  }, n = (s) => !l && i.readable && i.push(s), u = (s, h = 0) => {
    if (!s.length)
      return n(null);
    const f = (p, P) => {
      const g = h * t + P;
      return p().then((c) => n({ idx: g, result: c })).catch((c) => r ? a(Object.assign(c, { idx: g })) : n({ idx: g, result: c }));
    };
    return Promise.all(s[0].map(f)).then(() => s.length <= 1 ? n(null) : setTimeout(
      () => !l && i.readable && u(s.slice(1), h + 1),
      e
    ));
  };
  return u(d(o, t)), i;
}, w = (o, t, e = 0, r = !0) => {
  const i = (l, a = []) => l.length ? Promise.all(
    l[0].map((n) => r ? n() : n().catch((u) => u))
  ).then((n) => {
    const u = [...a, ...n];
    return l.length <= 1 ? u : new Promise((s, h) => setTimeout(
      () => i(l.slice(1), u).then(s, h),
      e
    ));
  }) : Promise.resolve(a);
  return i(d(o, t));
};
export {
  w as createPromise,
  L as createStream,
  w as default
};
