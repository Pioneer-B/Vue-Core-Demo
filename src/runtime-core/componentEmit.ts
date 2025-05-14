import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, eventName) {
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(eventName));
  const handler = props[handlerName];
  handler && handler();
}
