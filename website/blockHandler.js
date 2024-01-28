class BlockListHandler {
  addBlockList(elemToAppend = null, staticBlock = false) {
    const newBlockList = new BlockList(elemToAppend, staticBlock);
    this.blockLists.push(newBlockList);
    return newBlockList;
  }

  mergeBlockLists(blockList, blockList2, pos) {
    if (typeof blockList == "number") blockList = this.blockLists[blockList];
    if (typeof blockList2 == "number") blockList2 = this.blockLists[blockList2];
    blockList.mergeWithBlockList(pos, blockList2);
    this.blockLists.splice(this.blockLists.indexOf(blockList2), 1);
  }

  deleteBlockList(blockList) {
    blockList.delete();
    this.blockLists.splice(this.blockLists.indexOf(blockList), 1);
  }

  blockLists = [];
}
