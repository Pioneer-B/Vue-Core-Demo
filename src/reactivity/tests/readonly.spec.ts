import { isReadonly, readonly, isProxy } from "../reactive";

describe("readonly", () => {
  it("should make nested values readonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);

    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped)).toBe(true);

    expect(isReadonly(original.bar)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);

    expect(isProxy(wrapped)).toBe(true);
  });

  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });

    user.age = 11;
    // 看下调用set时，会不会调用console.warn
    expect(console.warn).toBeCalled();
  });
});
