import { reactive } from "../reactive";
import { computed } from "../computed";

describe("computed", () => {
  it("happy path", () => {
    // 缓存
    const user = reactive({ age: 10 });

    const age = computed(() => {
      return user.age;
    });

    expect(age.value).toBe(10);
  });

  it("should compute lazily", () => {
    const value = reactive({ foo: 1 });
    // jest.fn 包裹了 () => value.foo 这个函数，使其成为一个 mock 函数。
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // lazy
    // mock函数用途：
    // 1. 通过 expect(getter).not.toHaveBeenCalled() 可以验证该 getter 函数是否没有被调用。
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1); // 断言 getter 函数被调用了恰好 1 次。

    // should not compute value again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed 在需要之前不应该计算
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
