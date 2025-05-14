const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasOwn = (val, key) => {
    // Object.prototype.hasOwnProperty.call(val, key) 等效 val.hasOwnProperty(key)
    return Object.prototype.hasOwnProperty.call(val, key);
};
// add-foo => addFoo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ""));
};
// add -> Add    addFoo -> AddFoo
const capitallize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// Add => onAdd   AddFoo => onAddFoo
const toHandlerKey = (str) => {
    return str ? "on" + capitallize(str) : "";
};

// import { extend } from "../shared";
const targetMap = new Map();
function track(target, key) {
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
    return;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
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
function reactive(raw) {
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
function readonly(raw) {
    return new Proxy(raw, {
        get: createGetter(true),
        set(target, key, value) {
            console.warn(`${key} is readonly, ${target}`);
            return true;
        },
    });
}
function shallowReadonly(raw) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not an object`);
        return raw;
    }
    return new Proxy(raw, {
        get: createGetter(true, true),
        set(target, key, value) {
            console.warn(`${key} is readonly, ${target}`);
            return true;
        },
    });
}

function emit(instance, eventName) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(eventName));
    const handler = props[handlerName];
    handler && handler();
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    //   attrs
}

const pulicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots,
};
const PublicInstanceProxyHandles = {
    get({ _: instance }, key) {
        // setupState
        const { setupState, props } = instance;
        // if (key in setupState) {
        //   return setupState[key];
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // key -> $el
        const publicGetter = pulicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    instance.slots = Array.isArray(children) ? children : [children];
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        render: null,
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 初始化一个有状态的component
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // Proxy第一个参数: 表示ctx， get的target就是ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandles);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        // 将setup返回的对象挂载到实例上
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断vnode类型是 element 还是 component 类型
    const { shapeFlag } = vnode;
    //   if (typeof vnode.type === "string") {
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        // 处理 element
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        // 处理 componente
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    /**
     * 1. 初始化component，添加实例Proxy
     * 2. 将setup里的数据挂载到instance.setupState上
     * 3. 将render函数挂载到instance.render上
     */
    setupComponent(instance);
    /**
     * 4. 将render的this绑定到instance.proxy上
     */
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode ->patch
    // vnode -> element ->mountElement
    patch(subTree, container);
    // 在所有的element都mouted后，将vnode.el设置给组件vnode
    initialVNode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 将 element 保存到vnode中
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        children.forEach((child) => {
            patch(child, el);
        });
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const value = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            // onClick -> click
            const eventName = key.slice(2).toLowerCase();
            el.addEventListener(eventName, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    container.append(el);
}

/**
 * 如果是创建组件节点，调用createVNode时只会传入一个 对象参数，
 * 如：{
 *          render（）{...}
 *          setup（）{...}
 *      }
 * 如果是创建普通节点，调用createVNode时传入三个参数，
 * 如：
 * h("p", { class: "red" }, "hi")
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // children
    if (typeof children === "string") {
        // 这里不要装逼用 |=简写，搞得我之前半天捋不清
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots) {
    return createVNode("div", {}, slots);
}

export { createApp, h, renderSlots };
