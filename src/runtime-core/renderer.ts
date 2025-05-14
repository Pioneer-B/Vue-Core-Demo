import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断vnode类型是 element 还是 component 类型
  const { shapeFlag } = vnode;
  //   if (typeof vnode.type === "string") {
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 处理 element
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  // 将 element 保存到vnode中
  const el = (vnode.el = document.createElement(vnode.type));
  const { children, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((child) => {
      patch(child, el);
    });
  }

  // props
  const { props } = vnode;
  for (const key in props) {
    const value = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      // onClick -> click
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  container.append(el);
}
