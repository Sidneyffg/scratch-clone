class Runner {
  async run() {
    this.compile(blockListHandler.blockLists);

    const eventLoop = [];
    this.compiledBlockLists.forEach((compiledBlockList, idx) => {
      if (compiledBlockList[0] == blockIds.start) eventLoop.push(idx);
    });

    while (true) {
      if (eventLoop.length == 0) break;
      this.runEvent(eventLoop[0]);
      eventLoop.shift();
    }
  }

  runEvent(compiledBlockListId) {
    console.log(`Running compiled blockList with id ${compiledBlockListId}`);
    const compiledBlockList = this.compiledBlockLists[compiledBlockListId];
    compiledBlockList.forEach((blockId) => {
      if (typeof blockTemplates[blockId].run != "function") return;
      blockTemplates[blockId].run();
    });
  }

  compile(blockLists) {
    const timeStamp = Date.now();
    this.compiledBlockLists = [];
    blockLists.forEach((blockList) => {
      const compiledBlockList = [];
      blockList.blocks.forEach((block) => {
        compiledBlockList.push(block.blockId);
      });
      this.compiledBlockLists.push(compiledBlockList);
    });
    console.log(`Compiled all blockLists (${Date.now() - timeStamp} ms)`);
    console.log(this.compiledBlockLists);
  }

  compiledBlockLists;
}
