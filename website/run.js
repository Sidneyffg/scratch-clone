class Runner {
  async run() {
    this.compile(blockListHandler.blockLists);

    this.initEventLoop();

    while (true) {
      if (this.eventLoop.length == 0) {
        if (this.nextEventLoop.length == 0) break;
        await this.swapEventLoops();
      }
      this.runEvent(this.eventLoop[0]);
      this.eventLoop.shift();
    }
  }

  initEventLoop() {
    this.eventLoop = [];
    this.nextEventLoop = [];
    this.startBlockListIds.forEach((e) => {
      this.eventLoop.push({ compiledBlockListId: e, startLine: 0 });
    });
    this.startTimestamp = Date.now();
    console.log("Event loop:", this.eventLoop);
  }

  targetFramerate = 60;
  frameTime = Math.round(1000 / this.targetFramerate);
  swapEventLoops() {
    return new Promise((resolve) => {
      console.log("Next frame");
      this.eventLoop = this.nextEventLoop;
      this.nextEventLoop = [];
      const timestamp = Date.now();
      const diff = this.frameTime - (timestamp - this.startTimestamp);
      this.startTimestamp = timestamp;
      if (diff > 0) {
        this.startTimestamp += diff;
        setTimeout(() => {
          console.log(`Waited ${diff} ms...`);
          resolve();
        }, diff);
      } else resolve();
    });
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
          this.nextEventLoop.push(eventLoopItem);
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
