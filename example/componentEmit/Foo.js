import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit("add");
      emit("add-foo");
    };

    return {
      emitAdd,
    };
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("p", {}, "foo");

    return h("div", {}, [foo, btn]);
  },
};
