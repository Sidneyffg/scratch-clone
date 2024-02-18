class Block {
  /**
   * @param {blockTemplate} template
   */
  constructor(template) {
    this.createHtmlElem(template.color);
    this.loadContent(template.content);
    this.elem.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.parentBlockList.dragger.startDrag(this);
    });
    this.canConnectBottom = template.canConnectBottom;
    this.canConnectTop = template.canConnectTop;
    this.blockId = template.blockId;
    this.isDubbleBlock = template.isDubbleBlock;
    this.isInputBlock = template.isInputBlock;
    if (this.isDubbleBlock) {
      this.dubbleBlock = template.dubbleBlock;
      this.isFirstDubbleBlock = template.isFirstDubbleBlock;
    }
    if (this.isInputBlock) {
      this.elem.classList.add("input-block");
    }
  }

  /**
   * @param {string} color
   */
  createHtmlElem(color) {
    const elem = document.createElement("div");
    elem.classList.add("block");
    elem.style.backgroundColor = color;
    this.elem = elem;
  }

  indentation = 0;
  indentationWidth = 20;

  /**
   * @param {number} indentation
   */
  updateIndentation(indentation) {
    this.elem.style.marginLeft = indentation * this.indentationWidth + "px";
    this.indentation = indentation;
  }

  /**
   * @returns {BlockInput[]}
   */
  getAllNestedInputs() {
    return this.#getNestedInputs(this.inputs);
  }

  /**
   * @param {BlockInput[]} inputs
   * @returns {BlockInput[]}
   */
  #getNestedInputs(inputs) {
    const allInputs = [];
    inputs.forEach((e) => {
      if (typeof e.content == "string") return allInputs.push(e);
      allInputs.push(...this.#getNestedInputs(e.content.inputs));
    });
    return allInputs;
  }

  /**
   * @returns {Block[]}
   */
  getAllNestedBlocks() {
    return this.#getNestedBlocks(this.inputs);
  }

  /**
   * @param {BlockInput[]} inputs
   * @returns {Block[]}
   */
  #getNestedBlocks(inputs) {
    const allBlocks = [];
    inputs.forEach((e) => {
      if (typeof e.content == "string") return;
      allBlocks.push(e.content, ...this.#getNestedBlocks(e.content.inputs));
    });
    return allBlocks;
  }

  releaseInputBlock() {
    const parentBlockList = this.parentBlockList;
    parentBlockList.dragger.stopDrag();

    const rect = this.elem.getBoundingClientRect();
    this.parent.inputs.find((e) => e.content == this).updateContent("");
    const newBlockList = blockListHandler.addBlockList({
      position: {
        x: rect.left,
        y: rect.top,
      },
    });
    newBlockList.elem.appendChild(this.elem);
    newBlockList.blocks.push(this);
    this.parent = newBlockList;
    newBlockList.dragger.startDrag(this);
  }

  releaseFromBlockList() {
    const rect = this.elem.getBoundingClientRect();
    const newBlockList = blockListHandler.addBlockList({
      position: this.parent,
    });
    const idx = this.parent.blocks.indexOf(this);
    for (let i = 0; i < idx; i++) {
      newBlockList.transferBlock(this.parent.blocks[0]);
      this.parent.blocks.shift();
    }
    let depth = 0;
    for (let i = 0; i < this.parent.blocks.length; i++) {
      const block = this.parent.blocks[i];
      if (block.isSecondDubbleBlock) {
        if (depth == 0) {
          const blocksToRemove = this.parent.blocks.length - i;
          for (let j = 0; j < blocksToRemove; j++) {
            newBlockList.transferBlock(this.parent.blocks[i]);
            this.parent.blocks.splice(i, 1);
          }
          break;
        }
        depth--;
      }
      if (block.isFirstDubbleBlock) depth++;
    }
    this.parent.setPosition({ x: rect.left, y: rect.top });
    this.parent.reloadIndentations();
    newBlockList.reloadIndentations();
  }

  /**
   * @param {blockContent} content
   */
  loadContent(content) {
    this.elem.innerHTML = "";
    this.inputs = [];
    this.variableElem = null;
    content.forEach((e) => {
      if (typeof e == "string") {
        const elem = createElem("span", { innerHTML: e, classList: "text" });
        this.elem.appendChild(elem);
      }
      switch (e.element) {
        case "input":
          if (e.type == "variable") {
            const elem = createElem("select");
            elem.addEventListener("click", (e) => {
              if (e.pointerId != 1) {
                if (elem.value != "New variable") return;
                variableHandler.openNewVariablePopup(this);
                return;
              }
              this.reloadVariableSelect();
            });
            this.variableElem = elem;
            this.reloadVariableSelect();
            this.elem.appendChild(elem);
          } else {
            const elem = createElem("span", {
              role: "textbox",
              contentEditable: true,
              classList: "input",
            });
            this.elem.appendChild(elem);
            this.inputs.push(new BlockInput(this, e.type, elem));
          }
          break;
        case "img":
          //blockHtml += `<img src="${e.src}">`;
          break;
      }
    });
  }

  getParentBlockList() {
    let block = this;
    while (true) {
      if (!block.parentBlock) return block.parentBlockList;
    }
  }

  reloadVariableSelect() {
    const selectedOption = this.variableElem.value;
    this.variableElem.innerHTML = variableHandler.options;
    if (variableHandler.publicVariables[selectedOption] !== undefined)
      this.variableElem.value = selectedOption;
  }

  get parentBlockList() {
    let parent = this.parent;
    while (true) {
      if (parent instanceof BlockList) return parent;
      parent = parent.parent;
    }
  }
  get isSecondDubbleBlock() {
    return this.dubbleBlock && !this.isFirstDubbleBlock;
  }
  /**
   * @type {Block|BlockList}
   */
  parent = null;
  inputs;
  variableElem;
}
