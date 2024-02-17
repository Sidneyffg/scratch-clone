class Runner {
  async run() {
    this.compile(blockListHandler.blockLists);
    variableHandler.resetVariables();

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
      this.addEventLoopItem(id);
    });
    this.swapEventLoops(true);
    this.startTimestamp = Date.now();
    console.log("Event loop:", this.eventLoop);
  }

  targetFramerate = 60;
  frameTime = Math.round(1000 / this.targetFramerate);

  /**
   * @param {boolean} [skipWait]
   * @returns {Promise<void>}
   */
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

  /**
   * @param {eventLoopItem} eventLoopItem
   */
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
      const inputs = [];
      compiledBlock.inputs.forEach((e) =>
        inputs.push(this.genInputValueOfCompiledBlock(e))
      );
      blockTemplates[compiledBlock.action].run({
        inputs,
        variableName: compiledBlock.variableName,
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
        getCompiledConnectedDubbleBlock: (...args) =>
          this.getCompiledConnectedDubbleBlock(...args),
      });
      if (stopEvent) break;
    }
  }

  genInputValueOfCompiledBlock(input) {
    if (!input.isBlock) return this.parseInputValue(input.content, input.type);
    const values = [];
    input.content.forEach((content) => {
      values.push(this.genInputValueOfCompiledBlock(content));
    });
    return this.parseInputValue(
      blockTemplates[input.blockId].getValue(values).toString(),
      input.type
    );
  }

  /**
   * @param {string} value
   * @param {blockInputType} type
   */
  parseInputValue(value, type) {
    switch (type) {
      case "string":
        return value;
      case "float":
        const floatVal = parseFloat(value);
        return floatVal ? floatVal : 0;
      case "int":
        const intVal = parseInt(value);
        return intVal ? intVal : 0;
    }
  }

  /**
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
   * @param {compiledBlockListId} id
   * @param {number} startLine
   * @param {object} options
   * @param {number} options.startLine
   * @param {boolean} options.thisFrame
   */
  addEventLoopItem(compiledBlockListId, options = {}) {
    if (!options.startLine) options.startLine = 0;
    const event = { compiledBlockListId, startLine: options.startLine };
    if (options.thisFrame) this.eventLoop.push(event);
    else this.nextEventLoop.push(event);
  }

  /**
   * @param {BlockList[]} blockLists
   */
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
          inputs: this.compileInputBlock(block),
          variableName: block.variableElem?.value,
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

  /**
   * @param {Block} block
   */
  compileInputBlock(block, firstIteration = true) {
    const content = [];
    block.inputs.forEach((input) => {
      if (typeof input.content == "string")
        return content.push({
          content: input.content,
          isBlock: false,
          type: input.type,
        });
      const newContent = this.compileInputBlock(input.content, false);
      newContent.type = input.type;
      content.push(newContent);
    });
    if (firstIteration) return content;
    return { content, blockId: block.blockId, isBlock: true };
  }

  /**
   * @param {compiledBlockList} compiledBlockList
   * @param {number} blockNum
   * @returns {number}
   */
  getCompiledConnectedDubbleBlock(compiledBlockList, blockNum) {
    const blockTemplate = blockTemplates[compiledBlockList[blockNum].action];
    const dubbleBlockId = blockIds[blockTemplate.dubbleBlock];
    let depth = 0;
    if (blockTemplate.isFirstDubbleBlock) {
      for (let i = blockNum + 1; i < compiledBlockList.length; i++) {
        if (compiledBlockList[i].action == dubbleBlockId) {
          if (depth == 0) return i;
          depth--;
        } else if (
          compiledBlockList[i].action == compiledBlockList[blockNum].action
        )
          depth++;
      }
    } else {
      for (let i = blockNum - 1; i >= 0; i--) {
        if (compiledBlockList[i].action == dubbleBlockId) {
          if (depth == 0) return i;
          depth--;
        } else if (
          compiledBlockList[i].action == compiledBlockList[blockNum].action
        )
          depth++;
      }
    }
    console.log("Failed to find conneced dubble block...");
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
