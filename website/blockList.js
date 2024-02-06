class BlockList {
  constructor(elemToAppend = null, staticBlock = false) {
    this.static = staticBlock;
    if (!elemToAppend) elemToAppend = playField;
    this.createElem(elemToAppend);
  }

  addBlock(template) {
    const newBlock = new Block(template);
    this.elem.appendChild(newBlock.elem);
    this.blocks.push(newBlock);
  }

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

  releaseFromBlockList(startPos) {
    const newBlockList = blockListHandler.addBlockList();
    const top = this.elem.style.top;
    const left = this.elem.style.left;
    newBlockList.elem.style.top = top;
    newBlockList.elem.style.left = left;
    newBlockList.x = parseInt(left.slice(0, left.length - 2));
    newBlockList.y = parseInt(top.slice(0, top.length - 2));
    let missingBlockHeight = 0;
    for (let i = 0; i < startPos; i++) {
      missingBlockHeight += this.blocks[0].elem.offsetHeight;
      newBlockList.elem.appendChild(this.blocks[0].elem);
      newBlockList.blocks.push(this.blocks.shift());
    }
    let depth = 0;
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      if (isSecondDubbleBlock(block)) {
        if (depth == 0) {
          const blocksToRemove = this.blocks.length - i;
          for (let j = 0; j < blocksToRemove; j++) {
            newBlockList.elem.appendChild(this.blocks[i].elem);
            newBlockList.blocks.push(this.blocks.splice(i, 1)[0]);
          }
          break;
        }
        depth--;
      }
      if (block.isFirstDubbleBlock) depth++;
    }
    const topStr = this.elem.style.top;
    let currentTop = parseInt(topStr.slice(0, topStr.length - 2));
    currentTop = currentTop ? currentTop : 0;
    this.elem.style.top = currentTop + missingBlockHeight + "px";
    this.elem.style.left =
      this.x +
      this.blocks[0].indentation * this.blocks[0].indentationWidth +
      "px";
    this.reloadIndentations();
    newBlockList.reloadIndentations();
  }

  getAllNestedInputs(){
    
  }

  delete() {
    this.elem.remove();
  }

  deStatic() {
    const pos = this.elem.getBoundingClientRect();
    const parentDiv = this.elem.parentElement;
    this.elem.classList.remove("static");
    playField.appendChild(this.elem);
    this.elem.style.left = pos.left + "px";
    this.elem.style.top = pos.top + "px";
    blockDisplay.fillDisplayDiv(
      parentDiv,
      blockTemplates[this.blocks[0].blockId]
    );
    this.static = false;
  }

  reloadIndentations() {
    let indentation = 0;
    this.blocks.forEach((block) => {
      if (isSecondDubbleBlock(block)) indentation--;
      block.updateIndentation(indentation);
      if (block.isFirstDubbleBlock) indentation++;
    });
  }

  createElem(elemToAppend) {
    const elem = document.createElement("div");
    this.id = Math.floor(Math.random() * 60466176).toString(36);
    elem.id = "block-list-" + this.id;
    elem.classList.add("block-list");
    if (this.static) elem.classList.add("static");
    elem.style.top = this.y + "px";
    elem.style.left = this.x + "px";
    elemToAppend.appendChild(elem);

    dragElement(elem, this);
    this.elem = elem;
  }
  blocks = [];
  x = 0;
  y = 0;
}
