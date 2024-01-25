function createElem(type, data = null) {
  const elem = document.createElement(type);
  if (!data) return elem;
  Object.keys(data).forEach((key) => {
    elem[key] = data[key];
  });
  return elem;
}

Array.prototype.lastElement = function () {
  if (this.length == 0) return null;
  return this[this.length - 1];
};
