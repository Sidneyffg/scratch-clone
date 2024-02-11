class BlockListHandler {
  /**
   * @param {Object} options
   * @param {boolean} [options.elemToAppend]
   * @param {boolean} [options.staticBlock]
   * @param {{x,y}} [options.position]
   * @returns
   */
  addBlockList(options = {}) {
    const blockList = new BlockList(options);
    this.blockLists.push(blockList);
    return blockList;
  }

  /**
   * @param {BlockList} blockList
   * @param {BlockList} blockList2
   * @param {number} pos
   */
  mergeBlockLists(blockList, blockList2, pos) {
    if (typeof blockList == "number") blockList = this.blockLists[blockList];
    if (typeof blockList2 == "number") blockList2 = this.blockLists[blockList2];
    blockList.mergeWithBlockList(pos, blockList2);
    this.blockLists.splice(this.blockLists.indexOf(blockList2), 1);
  }

  /**
   * @param {BlockList} blockList
   */
  deleteBlockList(blockList) {
    blockList.delete();
    this.blockLists.splice(this.blockLists.indexOf(blockList), 1);
  }

  /**
   * @type {BlockList[]}
   */
  blockLists = [];
}
