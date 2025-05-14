import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true; // 看看getter是否执行过
  private _value: any; // 缓存值
  private _effect: any;
  constructor(getter) {
    this._getter = getter;
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    // 当依赖的响应式对象的值发生改变，dirty应该为true
    // 实现缓存功能，如果getter已经执行过了，就把值记录下，后面再访问时，直接返回这个值，没必要重复的执行getter()
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
