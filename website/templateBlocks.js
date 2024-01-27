const blockTemplates = [
  {
    content: ["Start"],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: false,
    name: "start",
  },
  {
    content: ["Log", { element: "input", type: "string" }],
    color: "green",
    canConnectBottom: true,
    canConnectTop: true,
    run: (inputs) => {
      console.log(inputs[0].content);
    },
  },
  {
    content: ["Broadcast", { element: "input", type: "string" }],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: true,
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
    content: ["Run on recieve", { element: "input", type: "string" }],
    color: "orange",
    canConnectBottom: true,
    canConnectTop: false,
    name: "recieveBroadcast",
  },
  {
    content: ["Stop"],
    color: "red",
    canConnectBottom: false,
    canConnectTop: true,
  },
];

const blockIds = {};
blockTemplates.forEach((e, idx) => {
  e.blockId = idx;
  blockIds[e.name] = e.blockId;
});
