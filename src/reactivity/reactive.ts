import { isObject } from "../shared/index";
import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

function createGetter(isReadonly = false, isShallowReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    if (isShallowReadonly) {
      return res;
    }

    // 看看res是不是Object类型，如果是，就继续代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      // 收集依赖
      track(target, key);
    }
    return res;
  };
}

export function reactive(raw) {
  if (!isObject(raw)) {
    console.warn(`target ${raw} is not an object`);
    return raw;
  }
  return new Proxy(raw, {
    get: createGetter(),

    set(target, key, value) {
      const res = Reflect.set(target, key, value);

      // 触发依赖
      trigger(target, key);
      return res;
    },
  });
}

export function isReactive(value) {
  /**
   * 这里需要触发 getter，因为getter里面有 isReadonly 标识，能知道该对象是不是 readonly
   * 如果不是 readonly，那么就是 reactive
   * 只要触发getter就行，和key没有关系，key为aaa bbb都可以，为了可读性。这里将key 设为 isReactive
   *
   * 为什么要取反？
   * 如果value不是 reactive，就不会进入到get，
   * 那么value[ReactiveFlags.IS_REACTIVE] 就为undefined，
   * expect(isReactive(original)).toBe(false); 就不能通过，所以要取反
   */
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: createGetter(true),

    set(target, key: any, value) {
      console.warn(`${key} is readonly, ${target}`);
      return true;
    },
  });
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function shallowReadonly(raw) {
  if (!isObject(raw)) {
    console.warn(`target ${raw} is not an object`);
    return raw;
  }
  return new Proxy(raw, {
    get: createGetter(true, true),
    set(target, key: any, value) {
      console.warn(`${key} is readonly, ${target}`);
      return true;
    },
  });
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
