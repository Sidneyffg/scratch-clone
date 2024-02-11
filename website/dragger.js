class Dragger {
  /**
   * @param {BlockList} blockList
   */
  constructor(blockList) {
    this.blockList = blockList;
  }

  /**
   * @param {Block} block
   */
  startDrag(block) {
    this.lastClickedBlock = block;
    document.onmousemove = (e) => this.#cursurMove(e);
    document.onmouseup = () => this.stopDrag();
    this.totalMovement = { x: 0, y: 0 };
    this.reachedMoveDistance = false;
  }

  stopDrag() {
    document.onmousemove = null;
    document.onmouseup = null;
    this.totalMovement = null;
    this.reachedMoveDistance = null;
    if (this.blockList.x < blockDisplay.width - blockDisplay.deletionBuffer)
      return blockListHandler.deleteBlockList(this.blockList);
    for (let i = 0; i < blockListHandler.blockLists.length; i++) {
      const otherBlockList = blockListHandler.blockLists[i];
      if (this.blockList === otherBlockList) continue;
      if (!this.blockList.isHoveringOverBlocklist(otherBlockList)) continue;
      if (this.handleHover(otherBlockList)) return;
    }
  }

  /**
   * @param {BlockList} hoveringBlockList
   * @returns {boolean} snapped to block
   */
  handleHover(hoveringBlockList) {
    if (this.blockList.blocks[0].isInputBlock) {
      const inputs = hoveringBlockList.getAllNestedInputs();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (!input.canSnap(this.blockList)) continue;
        input.addBlockToInput(this.blockList.blocks[0]);
        blockListHandler.deleteBlockList(this.blockList);
        return true;
      }
      return false;
    }
    if (!this.blockList.blocks[0].canConnectTop) return false;
    const hoveringNum = this.blockList.getHoveringNum(hoveringBlockList);
    if (
      hoveringNum === null ||
      !hoveringBlockList.blocks[hoveringNum - 1].canConnectBottom
    )
      return false;
    if (
      hoveringNum != hoveringBlockList.blocks.length &&
      !this.blockList.blocks.lastElement().canConnectBottom &&
      !hoveringBlockList.blocks[hoveringNum].isSecondDubbleBlock
    )
      return false;
    blockListHandler.mergeBlockLists(
      hoveringBlockList,
      this.blockList,
      hoveringNum
    );
    return true;
  }

  /**
   * @param {Event} event
   */
  #cursurMove(event) {
    if (!this.reachedMoveDistance) {
      this.totalMovement.x += event.movementX;
      this.totalMovement.y += event.movementY;
      const totalMovement =
        Math.abs(this.totalMovement.x) + Math.abs(this.totalMovement.y);
      if (totalMovement < 5) return;
      if (this.blockList.static) {
        this.blockList.deStatic();
      }
      if (
        this.lastClickedBlock.isDubbleBlock &&
        !this.lastClickedBlock.isFirstDubbleBlock
      ) {
        this.lastClickedBlock = this.blockList.getConnectedDubbleBlock(
          this.lastClickedBlock
        );
      }
      if (this.lastClickedBlock != this.blockList.blocks[0]) {
        if (this.lastClickedBlock.isInputBlock)
          this.lastClickedBlock.releaseInputBlock();
        else this.blockList.releaseFromBlockList(this.lastClickedBlock);
      }
      this.reachedMoveDistance = true;
      this.blockList.move(this.totalMovement);
    }
    this.blockList.move({ x: event.movementX, y: event.movementY });
  }

  /**
   * @type {Block}
   */
  lastClickedBlock;
  totalMovement;
  reachedMoveDistance;
}