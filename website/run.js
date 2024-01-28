class Runner {
  async run() {
    this.compile(blockListHandler.blockLists);

    this.eventLoop = [];
    this.eventLoop.push(...this.startBlockListIds);
    console.log("Event loop:", this.eventLoop);

    while (true) {
      if (this.eventLoop.length == 0) break;
      this.runEvent(this.eventLoop[0]);
      this.eventLoop.shift();
    }
  }

  runEvent(eventLoopItem) {
    console.log(`Running compiled blockList with id ${eventLoopItem}`);
    const compiledBlockList = this.compiledBlockLists[eventLoopItem];
    compiledBlockList.forEach((compiledBlock) => {
      if (typeof blockTemplates[compiledBlock.action].run != "function") return;
      blockTemplates[compiledBlock.action].run.call(this, compiledBlock.inputs);
    });
  }

  compile(blockLists) {
    const timeStamp = Date.now();
    this.compiledBlockLists = [];
    this.startBlockListIds = [];
    this.broadcastBlockLists = [];
    blockLists.forEach((blockList, idx) => {
      const compiledBlockList = [];
      blockList.blocks.forEach((block) => {
        compiledBlockList.push({ action: block.blockId, inputs: block.inputs });
      });
      if (compiledBlockList[0].action == blockIds.start)
        this.startBlockListIds.push(idx);
      if (compiledBlockList[0].action == blockIds.define)
        this.broadcastBlockLists.push({
          blockListId: idx,
          broadcastId: compiledBlockList[0].inputs[0].content,
        });
      this.compiledBlockLists.push(compiledBlockList);
    });
    console.log(`Compiled all blockLists (${Date.now() - timeStamp} ms)`);
    console.log(this.compiledBlockLists);
  }

  eventLoop;
  compiledBlockLists;
  startBlockListIds;
  // [{ blockListId, broadcastId }]
  broadcastBlockLists;
}
