class BlockList {
  constructor() {
    this.createElem();
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
    const topStr = this.elem.style.top;
    let currentTop = parseInt(topStr.slice(0, topStr.length - 2));
    currentTop = currentTop ? currentTop : 0;
    this.elem.style.top = currentTop + missingBlockHeight + "px";
  }

  delete() {
    this.elem.remove();
  }

  createElem() {
    const elem = document.createElement("div");
    this.id = Math.floor(Math.random() * 60466176).toString(36);
    elem.id = "block-list-" + this.id;
    elem.classList.add("block-list");
    playField.appendChild(elem);
    dragElement(elem, this);
    this.elem = elem;
  }
  blocks = [];
  x = 0;
  y = 0;
}
