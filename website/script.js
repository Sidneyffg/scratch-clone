const playField = document.getElementById("play-field");

const blockListHandler = new BlockListHandler();
blockListHandler.addBlockList();
blockListHandler.blockLists[0].addBlock(blockTemplates[0]);
blockListHandler.blockLists[0].addBlock(blockTemplates[1]);
blockListHandler.blockLists[0].addBlock(blockTemplates[2]);
