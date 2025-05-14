import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props) {
    // props功能2：setup中能访问到
    console.log(props);

    // props功能3：它是只读的（单向数据流）
    props.count++;
    console.log(props);
  },
  render() {
    // props功能1：render中能使用this访问
    return h("div", {}, `foo: ${this.count}`);
  },
};
