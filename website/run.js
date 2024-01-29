class Runner {
  async run() {
    this.compile(blockListHandler.blockLists);

    this.eventLoop = [];
    this.startBlockListIds.forEach((e) => {
      this.eventLoop.push({ compiledBlockListId: e, startLine: 0 });
    });
    console.log("Event loop:", this.eventLoop);

    while (true) {
      if (this.eventLoop.length == 0) break;
      this.runEvent(this.eventLoop[0]);
      this.eventLoop.shift();
    }
  }

  runEvent({ compiledBlockListId, startLine }) {
    console.log(`Running compiled blockList with id ${compiledBlockListId}`);
    const compiledBlockList = this.compiledBlockLists[compiledBlockListId];
    for (let i = startLine; i < compiledBlockList.length; i++) {
      const compiledBlock = compiledBlockList[i];
      if (typeof blockTemplates[compiledBlock.action].run != "function")
        continue;
      blockTemplates[compiledBlock.action].run({
        inputs: compiledBlock.inputs,
        compiledBlockListId,
        compiledBlockList,
        compiledBlockIdx: i,
        compiledBlockData: compiledBlock.data,
        editCompiledBlockData(newData) {
          compiledBlock.data = newData;
        },
        addEventLoopItem: (eventLoopItem) => {
          this.eventLoop.push(eventLoopItem);
        },
        broadcastBlockLists: this.broadcastBlockLists,
      });
    }
  }

  compile(blockLists) {
    const timeStamp = Date.now();
    this.compiledBlockLists = [];
    this.startBlockListIds = [];
    this.broadcastBlockLists = [];
    let idx = 0;
    blockLists.forEach((blockList) => {
      if (blockList.static) return;
      const compiledBlockList = [];
      blockList.blocks.forEach((block) => {
        compiledBlockList.push({
          action: block.blockId,
          inputs: block.inputs,
          data: null,
        });
      });
      if (compiledBlockList[0].action == blockIds.start)
        this.startBlockListIds.push(idx);
      if (compiledBlockList[0].action == blockIds.define)
        this.broadcastBlockLists.push({
          blockListId: idx,
          broadcastId: compiledBlockList[0].inputs[0].content,
        });
      this.compiledBlockLists.push(compiledBlockList);
      idx++;
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
