const blockTemplates = [
  {
    content: ["Start on", { element: "input", type: "number" }],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: false,
    name: "start",
  },
  {
    content: ["Middle", { element: "input", type: "number" }],
    color: "green",
    canConnectBottom: true,
    canConnectTop: true,
    run: (args) => {
      console.log("hello");
    },
  },
  {
    content: ["Stop", { element: "input", type: "number" }],
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
