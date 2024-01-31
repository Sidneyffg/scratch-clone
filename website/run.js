class Runner {
  async run() {
    this.compile(blockListHandler.blockLists);

    this.shouldStop = false;
    this.initEventLoop();

    while (true) {
      if (this.shouldStop) break;
      if (this.eventLoop.length == 0) {
        if (this.nextEventLoop.length == 0) break;
        await this.swapEventLoops();
      }
      this.runEvent(this.eventLoop[0]);
      this.eventLoop.shift();
    }
    console.log("Stopped");
  }

  stop() {
    this.shouldStop = true;
  }

  initEventLoop() {
    this.eventLoop = [];
    this.nextEventLoop = [];
    this.startBlockListIds.forEach((e) => {
      const template = this.templateCompiledBlockLists[e];
      const id = this.createCompiledBlockList(template);
      this.addEventLoopItem(id, 0);
    });
    this.swapEventLoops(true);
    this.startTimestamp = Date.now();
    console.log("Event loop:", this.eventLoop);
  }

  targetFramerate = 60;
  frameTime = Math.round(1000 / this.targetFramerate);
  swapEventLoops(skipWait = false) {
    return new Promise((resolve) => {
      if (!skipWait) console.log("Finished event loop");
      this.eventLoop = this.nextEventLoop;
      this.nextEventLoop = [];
      this.removeUnusedCompiledBlockLists();
      const timestamp = Date.now();
      const diff = this.frameTime - (timestamp - this.startTimestamp);
      this.startTimestamp = timestamp;
      if (diff > 0 && !skipWait) {
        this.startTimestamp += diff;
        setTimeout(() => {
          console.log(`Waited ${diff} ms...`);
          resolve();
        }, diff);
      } else resolve();
    });
  }

  removeUnusedCompiledBlockLists() {
    for (let i = 0; i < this.compiledBlockLists.length; i++) {
      if (this.compiledBlockLists[i] == null) continue;
      if (this.eventLoop.find((e) => e.compiledBlockListId == i)) continue;
      this.compiledBlockLists[i] = null;
      this.compiledBlockListsFreeSpots.push(i);
    }
  }

  runEvent({ compiledBlockListId, startLine }) {
    console.log(
      `Running compiled blockList with id ${compiledBlockListId} from block ${startLine}`
    );
    const compiledBlockList = this.compiledBlockLists[compiledBlockListId];
    let stopEvent = false;
    for (let i = startLine; i < compiledBlockList.length; i++) {
      const compiledBlock = compiledBlockList[i];
      if (typeof blockTemplates[compiledBlock.action].run != "function")
        continue;
      blockTemplates[compiledBlock.action].run({
        inputs: compiledBlock.inputs,
        compiledBlockListId,
        compiledBlockList,
        compiledBlockIdx: i,
        compiledBlockData: {
          get() {
            return compiledBlock.data;
          },
          set(newData) {
            compiledBlock.data = newData;
          },
          reset() {
            compiledBlock.data = null;
          },
        },
        addEventLoopItem: (...args) => this.addEventLoopItem(...args),
        createCompiledBlockList: (...args) =>
          this.createCompiledBlockList(...args),
        templateCompiledBlockLists: this.templateCompiledBlockLists,
        broadcastBlockLists: this.broadcastBlockLists,
        stopEvent: () => {
          stopEvent = true;
        },
        goToBlock: (blockIdx) => {
          i = blockIdx - 1;
        },
      });
      if (stopEvent) break;
    }
  }

  /**
   *
   * @param {compiledBlockListTemplate} template
   * @returns {compiledBlockListId}
   */
  createCompiledBlockList(template) {
    const compiledBlockList = structuredClone(template);
    const freeSpot = this.compiledBlockListsFreeSpots.pop();
    if (freeSpot !== undefined) {
      this.compiledBlockLists[freeSpot] = compiledBlockList;
      return freeSpot;
    }
    return this.compiledBlockLists.push(compiledBlockList) - 1;
  }

  /**
   *
   * @param {compiledBlockListId} id
   * @param {number} startLine
   * @param {Object} options
   * @param {boolean} options.thisFrame
   */
  addEventLoopItem(compiledBlockListId, startLine, options = {}) {
    const event = { compiledBlockListId, startLine };
    if (options.thisFrame) this.eventLoop.push(event);
    else this.nextEventLoop.push(event);
  }

  compile(blockLists) {
    const timeStamp = Date.now();
    this.templateCompiledBlockLists = [];
    this.compiledBlockLists = [];
    this.compiledBlockListsFreeSpots = [];
    this.startBlockListIds = [];
    this.broadcastBlockLists = [];
    let idx = 0;
    blockLists.forEach((blockList) => {
      if (blockList.static) return;
      const compiledBlockList = [];
      blockList.blocks.forEach((block) => {
        compiledBlockList.push({
          action: block.blockId,
          inputs: this.compileBlockInputs(block.inputs),
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
      this.templateCompiledBlockLists.push(compiledBlockList);
      idx++;
    });
    console.log(
      `Compiled ${this.templateCompiledBlockLists.length} blockLists (${
        Date.now() - timeStamp
      } ms)`
    );
    console.log(this.templateCompiledBlockLists);
  }

  compileBlockInputs(inputs) {
    const newInputs = [];
    inputs.forEach(({ type, content }) => {
      newInputs.push({ type, content });
    });
    return newInputs;
  }

  eventLoop;
  templateCompiledBlockLists;
  compiledBlockLists;
  compiledBlockListsFreeSpots;
  startBlockListIds;
  shouldStop;
  // [{ blockListId, broadcastId }]
  broadcastBlockLists;
  variables = [];
}
