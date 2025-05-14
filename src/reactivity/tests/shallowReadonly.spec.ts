import { isReadonly, readonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  test("shallowReadonly11", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });

  it("warn when call set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
    });

    user.age = 11;
    // 看下调用set时，会不会调用console.warn
    expect(console.warn).toBeCalled();
  });
});
