// import { extend } from "../shared";

let activeEffect;
let shouldTrack;
const targetMap = new Map();

export class ReactiveEffect {
  private _fn: any;
  deps: any = [];
  active = true;
  onStop?: () => void;
  public scheduler: Function | undefined;

  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    // 执行run后，就会收集依赖，需要判断下是否需要收集依赖
    // 比如 stop后，又执行了run，这时候就不需要 收集依赖 了
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;

    const result = this._fn();
    shouldTrack = false;

    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }

      this.active = false;
    }
  }
}

export function track(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (!isTracking()) return;

  trackEffects(dep);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  triggerEffects(dep);
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  // options
  // _effect.onStop = options.onStop;
  Object.assign(_effect, options);

  // extend
  //   extend(_effect, options);

  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}

// 抽离出来，为了ref中使用
export function trackEffects(dep) {
  // 如果已经在deps中了，就不需要收集了
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function isTracking() {
  // 如果只是获取，比如 expect(observed.foo).toBe(1);
  // activeEffect是不会有值的，只有efeect时，activeEffect才会有值
  return shouldTrack && activeEffect !== undefined;
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
