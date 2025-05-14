import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
  name: "App",
  render() {
    window.self = this;

    // ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "blue"],
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mousedown");
        },
      },
      [h("div", {}, `hi, ${this.msg}`), h(Foo, { count: 1 })]

      /**
       * children类型1：string
       * this能取到哪些数据？setupState $el
       */
      //   `hi, ${this.msg}`

      /**
       * children类型2：array
       */
      //   [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "mini-vue")]
    );
  },

  setup() {
    return {
      msg: "mini-vue11",
    };
  },
};
