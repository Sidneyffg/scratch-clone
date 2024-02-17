interface blockTemplate {
  content: blockContent;
  color: string;
  conConnectBottom: boolean;
  canConnectTop: boolean;
  isDubbleBlock?: boolean;
  dubbleBlock?: string;
  isFirstDubbleBlock?: boolean;
  isInputBlock?: boolean;
  name: string;
  run?: (_: blockTemplateRun) => {};
  getValue?: (inputs: string[]) => {};
}

type blockContent = Array<
  | string
  | {
      element: "input" | "image";
      type?: blockInputType;
    }
>;

interface blockTemplateRun {
  // later
}

type blockInputType = "int" | "float" | "string";

type blockInputContent = string | Block;

interface eventLoopItem {
  compiledBlockListId: number;
  startLine: number;
}
