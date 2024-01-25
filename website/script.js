const playField = document.getElementById("play-field");

class Block {
  constructor(type) {
    this.createHtmlElem();
    this.elem.addEventListener("mousedown", () => {
      this.lastClick = Date.now();
    });
  }
  lastClick = 0;
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
    //this.addBlock();
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

  releaseFromBlockList(startPos) {
    const newBlockList = blockListHandler.addBlockList();
    const top = this.elem.style.top;
    const left = this.elem.style.left;
    newBlockList.elem.style.top = top;
    newBlockList.elem.style.left = left;
    newBlockList.x = parseInt(left.slice(0, left.length - 2));
    newBlockList.y = parseInt(top.slice(0, top.length - 2));
    for (let i = 0; i < startPos; i++) {
      newBlockList.elem.appendChild(this.blocks[0].elem);
      newBlockList.blocks.push(this.blocks.shift());
    }
    const topStr = this.elem.style.top;
    let currentTop = parseInt(topStr.slice(0, topStr.length - 2));
    currentTop = currentTop ? currentTop : 0;
    this.elem.style.top = currentTop + startPos * 40 + "px";
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

class BlockListHandler {
  constructor() {}

  addBlockList(amount = null) {
    if (!amount) {
      const newBlockList = new BlockList();
      this.blockLists.push(newBlockList);
      return newBlockList;
    }
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
blockListHandler.blockLists[0].addBlock(5);
blockListHandler.blockLists[1].addBlock(3);
