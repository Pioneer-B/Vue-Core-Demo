import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge = undefined;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update age      user.age= user.age + 1
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("should return runner when call effect", () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });

    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });

    obj.prop = 2;
    expect(dummy).toBe(2);

    stop(runner);

    // obj.prop = 3;
    obj.prop++; // obj.prop= obj.prop + 1
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });

    const onStop = jest.fn();

    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    // 使用expect断言onStop函数被调用了一次
    expect(onStop).toBeCalledTimes(1);
  });
});
