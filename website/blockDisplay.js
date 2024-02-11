class BlockDisplay {
  constructor() {
    this.elem = document.getElementById("block-display");
    this.width = this.elem.offsetWidth;
    this.init();
  }

  init() {
    blockTemplates.forEach((blockTemplate) => {
      if (blockTemplate.isDubbleBlock && !blockTemplate.isFirstDubbleBlock)
        return;
      const div = document.createElement("div");
      this.elem.appendChild(div);
      this.fillDisplayDiv(div, blockTemplate);
    });
  }

  /**
   * @param {HTMLElement} div
   * @param {blockTemplate} blockTemplate
   */
  fillDisplayDiv(div, blockTemplate) {
    const blockList = blockListHandler.addBlockList({
      elemToAppend: div,
      staticBlock: true,
    });
    blockList.addBlock(blockTemplate);
    if (blockTemplate.isDubbleBlock) {
      const dubbleBlockTemplate = blockTemplates.find(
        (e) => e.name == blockTemplate.dubbleBlock
      );
      blockList.addBlock(dubbleBlockTemplate);
    }
  }
  deletionBuffer = 20;
}
