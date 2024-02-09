/**
 * @param {string} type
 * @param {object} [data]
 * @returns {HTMLElement}
 */
function createElem(type, data = null) {
  const elem = document.createElement(type);
  if (!data) return elem;
  Object.keys(data).forEach((key) => {
    elem[key] = data[key];
  });
  return elem;
}

/**
 * @param {Block} block
 * @returns {boolean}
 */
function isSecondDubbleBlock(block) {
  return block.isDubbleBlock && !block.isFirstDubbleBlock;
}

Array.prototype.lastElement = function () {
  if (this.length == 0) return null;
  return this[this.length - 1];
};
