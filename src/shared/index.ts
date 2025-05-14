export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasOwn = (val, key) => {
  // Object.prototype.hasOwnProperty.call(val, key) 等效 val.hasOwnProperty(key)
  return Object.prototype.hasOwnProperty.call(val, key);
};

// add-foo => addFoo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => (c ? c.toUpperCase() : ""));
};
// add -> Add    addFoo -> AddFoo
const capitallize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// Add => onAdd   AddFoo => onAddFoo
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitallize(str) : "";
};
