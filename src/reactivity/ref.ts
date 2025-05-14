import { isObject } from "../shared/index";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value; // 保存原始值
    this._value = isObject(value) ? reactive(value) : value;
    this.dep = new Set();
  }

  get value() {
    /**
     * 如果只是获取。比如
     * const a = ref(1);
     * expect(a.value).toBe(1);
     * 那么activeEffect是undefined，所以这里要判断下
     */
    if (isTracking()) {
      trackEffects(this.dep);
    }

    return this._value;
  }
  set value(newValue) {
    if (Object.is(newValue, this._rawValue)) return;

    this._rawValue = newValue;
    // 注意顺序，先修改value，再进行通知
    this._value = isObject(newValue) ? reactive(newValue) : newValue;
    triggerEffects(this.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

// 用于获取 ref 对象的原始值
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 1.之前value值类型是ref，并且新值不是ref
      if (isRef(target[key]) && !isRef(value)) {
        // 1.1 那么就修改value的值，
        // 注意：这里为什么不是target[key] = value
        // 答案：proxyUser.age 其实就是 proxyUser.age， 只是可以省略.value进行简写
        return (target[key].value = value);
      } else {
        // 这里为什么是替换？而不是像上面一样 去赋值
        // 答案：因为这里的value是ref，他本质就是一个带value的对象。
        return Reflect.set(target, key, value);
      }
    },
  });
}
