class BlockList {
  /**
   * @param {object} options
   * @param {HTMLElement} [options.elemToAppend]
   * @param {boolean} [options.staticBlock]
   * @param {HTMLElement} [options.elemToAppend]
   * @param {{x,y}} [options.position]
   */
  constructor(options = {}) {
    this.static = options.staticBlock || false;
    if (!options.elemToAppend) options.elemToAppend = playField;
    this.createElem(options.elemToAppend);
    if (options.position) this.setPosition(options.position);
    this.dragger = new Dragger(this);
  }

  /**
   * @param {blockTemplate} template
   */
  addBlock(template) {
    const newBlock = new Block(template);
    newBlock.parent = this;
    this.elem.appendChild(newBlock.elem);
    this.blocks.push(newBlock);
  }

  /**
   * @param {Block} block
   */
  transferBlock(block) {
    this.elem.appendChild(block.elem);
    this.blocks.push(block);
  }

  /**
   * @param {number} pos
   * @param {BlockList} blockList
   */
  mergeWithBlockList(pos, blockList) {
    if (pos == this.blocks.length) {
      blockList.blocks.forEach((block) => {
        this.elem.appendChild(block.elem);
        this.blocks.push(block);
      });
    } else {
      const insertBeforeElem = this.blocks[pos].elem;
      blockList.blocks.forEach((block) => {
        this.elem.insertBefore(block.elem, insertBeforeElem);
      });
      this.blocks.splice(pos, 0, ...blockList.blocks);
    }
    blockList.delete();
    this.reloadIndentations();
  }

  /**
   * @returns {BlockInput[]}
   */
  getAllNestedInputs() {
    const inputs = [];
    this.blocks.forEach((e) => {
      inputs.push(...e.getAllNestedInputs());
    });
    return inputs;
  }

  delete() {
    this.elem.remove();
    const idx = blockListHandler.blockLists.indexOf(this);
    blockListHandler.blockLists.splice(idx, 1);
  }

  /**
   * @param {{x,y}} position
   */
  setPosition({ x, y }) {
    if (typeof x == "string") {
      x = parseInt(x.substring(0, x.length - 2));
      y = parseInt(x.substring(0, y.length - 2));
    }
    this.elem.style.left = x + "px";
    this.elem.style.top = y + "px";
    this.x = x;
    this.y = y;
  }

  /**
   * @param {{x,y}} relativePosition
   */
  move({ x, y }) {
    this.setPosition({ x: this.x + x, y: this.y + y });
  }

  deStatic() {
    const pos = this.elem.getBoundingClientRect();
    const parentDiv = this.elem.parentElement;
    this.elem.classList.remove("static");
    playField.appendChild(this.elem);
    this.setPosition({ x: pos.left, y: pos.top });
    blockDisplay.fillDisplayDiv(
      parentDiv,
      blockTemplates[this.blocks[0].blockId]
    );
    this.static = false;
  }

  reloadIndentations() {
    let indentation = 0;
    this.blocks.forEach((block) => {
      block.parent = this;
      if (isSecondDubbleBlock(block)) indentation--;
      block.updateIndentation(indentation);
      if (block.isFirstDubbleBlock) indentation++;
    });
  }

  /**
   * @param {HTMLElement} elemToAppend
   */
  createElem(elemToAppend) {
    const elem = document.createElement("div");
    this.id = Math.floor(Math.random() * 60466176).toString(36);
    elem.id = "block-list-" + this.id;
    elem.classList.add("block-list");
    if (this.static) elem.classList.add("static");
    elem.style.top = this.y + "px";
    elem.style.left = this.x + "px";
    elemToAppend.appendChild(elem);
    this.elem = elem;
  }

  /**
   * @param {Block} block
   * @returns {Block}
   */
  getConnectedDubbleBlock(block) {
    const dubbleBlockId = blockIds[block.dubbleBlock];
    const blockNum = this.blocks.indexOf(block);
    let depth = 0;
    if (block.isFirstDubbleBlock) {
      for (let i = blockNum + 1; i < this.blocks.length; i++) {
        if (this.blocks[i].blockId == dubbleBlockId) {
          if (depth == 0) return this.blocks[i];
          depth--;
        } else if (this.blocks[i].blockId == block.blockId) depth++;
      }
    } else {
      for (let i = blockNum - 1; i >= 0; i--) {
        if (this.blocks[i].blockId == dubbleBlockId) {
          if (depth == 0) return this.blocks[i];
          depth--;
        } else if (this.blocks[i].blockId == block.blockId) depth++;
      }
    }
    console.log("Failed to find conneced dubble block...");
  }

  /**
   * @param {BlockList} blockList
   * @returns {boolean}
   */
  isHoveringOverBlocklist(blockList) {
    const otherHeight = blockList.getTotalHeightOfBlockList();
    const otherWidth = blockList.getTotalWidthOfBlockList();

    return (
      this.x > blockList.x - this.snapDistance &&
      this.x < blockList.x + this.halfSnapDistance + otherWidth &&
      this.y > blockList.y - this.snapDistance &&
      this.y < blockList.y + this.halfSnapDistance + otherHeight
    );
  }
  snapDistance = 60;
  halfSnapDistance = this.snapDistance / 2;

  /**
   * gets position of block of hovered over blocklist
   * @param {BlockList} blockList
   * @returns {number|null}
   */
  getHoveringNum(blockList) {
    let passedHeight = 0;
    const heightFromTop = this.y - blockList.y;
    for (let i = 0; i < blockList.blocks.length; i++) {
      const block = blockList.blocks[i];
      const blockHeight = block.elem.offsetHeight;
      const snapDistanceY = blockHeight / 2;
      const indentation = block.indentation * block.indentationWidth;
      passedHeight += snapDistanceY;
      if (
        passedHeight <= heightFromTop &&
        passedHeight + 2 * snapDistanceY >= heightFromTop &&
        this.x > blockList.x + indentation - this.snapDistance &&
        this.x < blockList.x + indentation + this.snapDistance
      ) {
        return i + 1;
      }
      passedHeight += snapDistanceY;
    }
    return null;
  }

  /**
   * @returns {number}
   */
  getTotalHeightOfBlockList() {
    let height = 0;
    this.blocks.forEach((block) => {
      height += block.elem.offsetHeight;
    });
    return height;
  }

  /**
   * @returns {number}
   */
  getTotalWidthOfBlockList() {
    let hightestWidth = 0;
    this.blocks.forEach((block) => {
      const totalBlockWidth =
        block.indentation * block.indentationWidth + block.elem.offsetWidth;
      hightestWidth = Math.max(hightestWidth, totalBlockWidth);
    });
    return hightestWidth;
  }

  /**
   * @type {Block[]}
   */
  blocks = [];
  x = 0;
  y = 0;
}
