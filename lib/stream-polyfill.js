export class Readable {
  constructor() {
    this.readable = true;
    this.listeners = {};
  }

  getListeners(eventName) {
    return this.listeners[eventName] || [];
  }

  on(eventName, fn) {
    Object.assign(this.listeners, {
      [eventName]: this.getListeners(eventName).concat(fn),
    });
    return this;
  }

  off(eventName, fn) {
    Object.assign(this.listeners, {
      [eventName]: this.getListeners(eventName).filter(item => item !== fn),
    });
    return this;
  }

  emit(eventName, data) {
    setTimeout(() => {
      this.getListeners(eventName).forEach(fn => fn(data));
    });
  }

  push(chunk) {
    if (chunk === null) {
      return this.emit('end');
    }
    return this.emit('data', chunk);
  }
}

export default { Readable };
