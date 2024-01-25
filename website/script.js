const playField = document.getElementById("play-field");

class Block {
  constructor(type) {
    this.createHtmlElem();
  }

  createHtmlElem() {
    const elem = document.createElement("div");
    elem.classList.add("block");
    const color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    elem.style.backgroundColor = color;
    this.elem = elem;
  }
}

class BlockList {
  constructor() {
    this.createElem();
    this.addBlock();
  }

  addBlock(amount = 1) {
    for (let i = 0; i < amount; i++) {
      const newBlock = new Block();
      this.elem.appendChild(newBlock.elem);
      this.blocks.push(newBlock);
    }
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

  delete() {
    this.elem.remove();
  }

  createElem() {
    const elem = document.createElement("div");
    elem.classList.add("block-list");
    playField.appendChild(elem);
    dragElement(elem, this);
    this.elem = elem;
  }
  blocks = [];
  x = 0;
  y = 0;
}

class BlockListHandler {
  constructor() {}

  addBlockList(amount = 1) {
    for (let i = 0; i < amount; i++) this.blockLists.push(new BlockList());
  }

  mergeBlockLists(blockList, blockList2, pos) {
    if (typeof blockList == "number") blockList = this.blockLists[blockList];
    if (typeof blockList2 == "number") blockList2 = this.blockLists[blockList2];
    blockList.mergeWithBlockList(pos, blockList2);
    this.blockLists.splice(this.blockLists.indexOf(blockList2), 1);
  }

  blockLists = [];
}
const blockListHandler = new BlockListHandler();
blockListHandler.addBlockList(2);
blockListHandler.blockLists[0].addBlock(4);
blockListHandler.blockLists[1].addBlock(2);
