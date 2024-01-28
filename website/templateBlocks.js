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
    run: (inputs) => {
      console.log(inputs[0].content);
    },
  },
  {
    content: ["Call", { element: "input", type: "string" }],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: false,
    run: function (inputs) {
      const broadcastId = inputs[0].content;
      if (!broadcastId) return;
      this.broadcastBlockLists.forEach((e) => {
        if (e.broadcastId == broadcastId) {
          this.eventLoop.push(e.blockListId);
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
  },
  {
    content: ["Forever"],
    color: "green",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "closeForever2",
    isFirstDubbleBlock: true,
    name: "forever2",
  },
  {
    content: [],
    color: "green",
    canConnectBottom: false,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "forever2",
    isFirstDubbleBlock: false,
    name: "closeForever2",
  },
  {
    content: ["Forever"],
    color: "blue",
    canConnectBottom: true,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "closeForever3",
    isFirstDubbleBlock: true,
    name: "forever3",
  },
  {
    content: [],
    color: "blue",
    canConnectBottom: false,
    canConnectTop: true,
    isDubbleBlock: true,
    dubbleBlock: "forever3",
    isFirstDubbleBlock: false,
    name: "closeForever3",
  },
];

const blockIds = {};
blockTemplates.forEach((e, idx) => {
  e.blockId = idx;
  blockIds[e.name] = e.blockId;
});
