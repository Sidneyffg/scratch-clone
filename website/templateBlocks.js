const blockTemplates = [
  {
    content: ["Start on", { element: "input", type: "number" }],
    color: "yellow",
    canConnectBottom: true,
    canConnectTop: false,
  },
  {
    content: ["Middle", { element: "input", type: "number" }],
    color: "green",
    canConnectBottom: true,
    canConnectTop: true,
  },
  {
    content: ["Stop", { element: "input", type: "number" }],
    color: "red",
    canConnectBottom: false,
    canConnectTop: true,
  },
];
