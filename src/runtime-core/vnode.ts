import { ShapeFlags } from "../shared/ShapeFlags";

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
export function createVNode(type, props?, children?) {
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
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
