import { hasOwn } from "../shared/index";

const pulicPropertiesMap = {
  $el: (instance) => instance.vnode.el,
  $slots: (instance) => instance.slots,
};

export const PublicInstanceProxyHandles = {
  get({ _: instance }, key) {
    // setupState
    const { setupState, props } = instance;

    // if (key in setupState) {
    //   return setupState[key];
    // }

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    // key -> $el
    const publicGetter = pulicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
