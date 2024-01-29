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
      console.log(inputs[0].content);
    },
  },
  {
    content: ["Call", { element: "input", type: "string" }],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: false,
    run({ inputs, addEventLoopItem, broadcastBlockLists }) {
      const broadcastId = inputs[0].content;
      if (!broadcastId) return;
      broadcastBlockLists.forEach((e) => {
        if (e.broadcastId == broadcastId) {
          addEventLoopItem({
            compiledBlockListId: e.blockListId,
            startLine: 0,
          });
        }
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
    }) {
      const connectedBlock = getCompiledConnectedDubbleBlock(
        compiledBlockList,
        compiledBlockIdx
      );
      console.log(connectedBlock);
      addEventLoopItem({ compiledBlockListId, startLine: connectedBlock });
    },
  },
  {
    content: ["Repeat", { element: "input", type: "number" }, "times"],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "closeForever",
    isFirstDubbleBlock: true,
    name: "repeat",
    run(inputs) {
      const repeatNumber = inputs[0].content;
    },
  },
  {
    content: [],
    color: "yellow",
    canConnectBottom: false,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "forever",
    isFirstDubbleBlock: false,
    name: "closeRepeat",
    run() {},
  },
];

const blockIds = {};
blockTemplates.forEach((e, idx) => {
  e.blockId = idx;
  blockIds[e.name] = e.blockId;
});
