/**
 * @type {blockTemplate[]}
 */
const blockTemplates = [
  {
    content: ["Start"],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: false,
    isDubbleBlock: false,
    name: "start",
  },
  {
    content: ["Log", { element: "input", type: "string" }],
    color: "green",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: false,
    run({ inputs }) {
      console.log("[log]", inputs[0].content);
    },
  },
  {
    content: ["Call", { element: "input", type: "string" }],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: false,
    run({
      inputs,
      templateCompiledBlockLists,
      createCompiledBlockList,
      addEventLoopItem,
      broadcastBlockLists,
    }) {
      const broadcastId = inputs[0].content;
      if (!broadcastId) return;
      broadcastBlockLists.forEach((e) => {
        if (e.broadcastId != broadcastId) return;
        const id = createCompiledBlockList(
          templateCompiledBlockLists[e.blockListId]
        );
        addEventLoopItem(id);
      });
    },
  },
  {
    content: ["Define", { element: "input", type: "string" }],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: false,
    isDubbleBlock: false,
    name: "define",
  },
  {
    content: ["Forever"],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "closeForever",
    isFirstDubbleBlock: true,
    name: "forever",
  },
  {
    content: [],
    color: "yellow",
    canConnectBottom: false,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "forever",
    isFirstDubbleBlock: false,
    name: "closeForever",
    run({
      compiledBlockListId,
      compiledBlockList,
      compiledBlockIdx,
      addEventLoopItem,
      getCompiledConnectedDubbleBlock,
    }) {
      const connectedBlock = getCompiledConnectedDubbleBlock(
        compiledBlockList,
        compiledBlockIdx
      );
      addEventLoopItem(compiledBlockListId, { startLine: connectedBlock });
    },
  },
  {
    content: ["Repeat", { element: "input", type: "int" }, "times"],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "closeRepeat",
    isFirstDubbleBlock: true,
    name: "repeat",
    run({
      inputs,
      compiledBlockList,
      compiledBlockIdx,
      compiledBlockListId,
      compiledBlockData,
      addEventLoopItem,
      stopEvent,
      getCompiledConnectedDubbleBlock,
    }) {
      let action;
      let data = compiledBlockData.get();
      if (data == null) {
        const repeatNumber = inputs[0].content;
        if (!repeatNumber) action = "continue";
        else {
          compiledBlockData.set(repeatNumber);
          data = repeatNumber;
          action = "loop";
        }
      } else if (data == 0) action = "continue";
      else action = "loop";

      switch (action) {
        case "continue":
          const idx =
            getCompiledConnectedDubbleBlock(
              compiledBlockList,
              compiledBlockIdx
            ) + 1;
          if (idx >= compiledBlockList.length) break;
          addEventLoopItem(compiledBlockListId, { startLine: idx });
          compiledBlockData.reset();
          break;
        case "loop":
          addEventLoopItem(compiledBlockListId, {
            startLine: compiledBlockIdx + 1,
          });
          compiledBlockData.set(data - 1);
          break;
      }
      stopEvent();
    },
  },
  {
    content: [],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "repeat",
    isFirstDubbleBlock: false,
    name: "closeRepeat",
    run({
      compiledBlockList,
      compiledBlockIdx,
      goToBlock,
      getCompiledConnectedDubbleBlock,
    }) {
      const idx = getCompiledConnectedDubbleBlock(
        compiledBlockList,
        compiledBlockIdx
      );
      goToBlock(idx);
    },
  },
  {
    content: [
      "Set",
      { element: "input", type: "variable" },
      "to",
      { element: "input", type: "string" },
    ],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: false,
    run({ variableName, inputs }) {
      if (
        !variableName ||
        variableHandler.publicVariables[variableName] === undefined
      )
        return;
      variableHandler.publicVariables[variableName] = inputs[0].content;
    },
  },
  {
    content: [
      { element: "input", type: "float" },
      "+",
      { element: "input", type: "float" },
    ],
    color: "#00ab41",
    canConnectBottom: false,
    canConnectTop: false,
    isDubbleBlock: false,
    isInputBlock: true,
    run({ inputs }) {
      return inputs[0].content + inputs[1].content;
    },
  },
];

const blockIds = {};
blockTemplates.forEach((e, idx) => {
  e.blockId = idx;
  blockIds[e.name] = e.blockId;
});
