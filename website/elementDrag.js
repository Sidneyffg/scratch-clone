/**
 * @param {BlockList} blockList
 * @param {object} listener
 */
function dragElement(blockList, listener) {
  listener.drag = dragMouseDown;
  listener.stopDrag = () => {
    document.onmouseup = null;
    document.onmousemove = null;
  };
  const elem = blockList.elem;
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  let lastClickedBlock = null;

  /**
   * @param {Event} e
   */
  function dragMouseDown(e) {
    lastClickedBlock = findLastClickedBlock(blockList);
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    if (!blockList.static) return;
    blockList.deStatic();
  }

  /**
   * @param {Event} e
   */
  function elementDrag(e) {
    if (e.movementX == 0 && e.movementY == 0) return;
    e.preventDefault();
    if (lastClickedBlock != null) {
      if (
        lastClickedBlock.isDubbleBlock &&
        !lastClickedBlock.isFirstDubbleBlock
      ) {
        lastClickedBlock = getConnectedDubbleBlock(blockList, lastClickedBlock);
        lastClickedBlock = blockList.blocks[lastClickedBlock];
      }
      if (lastClickedBlock != blockList.blocks[0]) {
        if (lastClickedBlock.parentBlock != null)
          lastClickedBlock.releaseInputBlock();
        else blockList.releaseFromBlockList(lastClickedBlock);
      }
      lastClickedBlock = null;
      playField.appendChild(blockList.elem); //show in front of other blockLists
    }
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    let top = elem.offsetTop - pos2;
    let left = elem.offsetLeft - pos1;
    top = Math.min(
      Math.max(top, 0),
      playField.offsetHeight - elem.offsetHeight
    );
    left = Math.min(
      Math.max(left, 0),
      playField.offsetWidth - elem.offsetWidth
    );
    elem.style.top = top + "px";
    elem.style.left = left + "px";
    blockList.x = left;
    blockList.y = top;
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (blockList.x + 20 < blockDisplay.width) {
      blockListHandler.deleteBlockList(blockList);
      return;
    }
    for (let i = 0; i < blockListHandler.blockLists.length; i++) {
      const otherBlockList = blockListHandler.blockLists[i];
      if (blockList == otherBlockList || otherBlockList.static) continue;
      // pos of where block whill come
      const isHovering = isHoveringOverBlocklist(blockList, otherBlockList);
      if (!isHovering) continue;
      if (handleHover(otherBlockList)) return;
    }
  }

  /**
   * @param {BlockList} otherBlockList
   * @returns {boolean} snapped to block
   */
  function handleHover(otherBlockList) {
    if (blockList.blocks[0].isInputBlock) {
      const inputs = otherBlockList.getAllNestedInputs();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (!canSnapToInput(blockList, otherBlockList, input.elem)) continue;
        input.addBlockToInput(blockList.blocks[0]);
        blockListHandler.deleteBlockList(blockList);
        return true;
      }
      return false;
    }
    if (!blockList.blocks[0].canConnectTop) return;
    const hoveringNum = getHoveringNum(blockList, otherBlockList);
    if (
      hoveringNum === null ||
      !otherBlockList.blocks[hoveringNum - 1].canConnectBottom
    )
      return false;
    if (
      hoveringNum != otherBlockList.blocks.length &&
      !blockList.blocks.lastElement().canConnectBottom &&
      !isSecondDubbleBlock(otherBlockList.blocks[hoveringNum])
    )
      return false;
    blockListHandler.mergeBlockLists(otherBlockList, blockList, hoveringNum);
    return true;
  }
}
const snapDistance = 60;
const halfSnapDistance = snapDistance / 2;
/**
 * @param {BlockList} selected 
 * @param {BlockList} other 
 * @returns {boolean}
 */
function isHoveringOverBlocklist(selected, other) {
  const otherHeight = getTotalHeightOfBlockList(other);
  const otherWidth = getTotalWidthOfBlockList(other);
  return (
    selected.x > other.x - snapDistance &&
    selected.x < other.x + halfSnapDistance + otherWidth &&
    selected.y > other.y - snapDistance &&
    selected.y < other.y + halfSnapDistance + otherHeight
  );
}

const inputSnapDistance = 15;
const stdInputWidth = 30;
const stdInputHeight = 20;
/**
 * @param {BlockList} selected 
 * @param {BlockList} other 
 * @param {HTMLElement} inputElem
 * @returns {boolean}
 */
function canSnapToInput(selected, other, inputElem) {
  const x = inputElem.offsetLeft + other.x;
  const y = inputElem.offsetTop + other.y;
  return (
    selected.x > x - inputSnapDistance &&
    selected.x < x + stdInputWidth &&
    selected.y > y - inputSnapDistance &&
    selected.y < y + stdInputHeight
  );
}

/**
 * @param {BlockList} selected 
 * @param {BlockList} other 
 * @returns {number|null}
 */
function getHoveringNum(selected, other) {
  let passedHeight = 0;
  const heightFromTop = selected.y - other.y;
  for (let i = 0; i < other.blocks.length; i++) {
    const block = other.blocks[i];
    const blockHeight = block.elem.offsetHeight;
    const snapDistanceY = blockHeight / 2;
    const indentation = block.indentation * block.indentationWidth;
    passedHeight += snapDistanceY;
    if (
      passedHeight <= heightFromTop &&
      passedHeight + 2 * snapDistanceY >= heightFromTop &&
      selected.x > other.x + indentation - snapDistance &&
      selected.x < other.x + indentation + snapDistance
    ) {
      return i + 1;
    }
    passedHeight += snapDistanceY;
  }
  return null;
}

/**
 * @param {BlockList} blockList 
 * @returns {number}
 */
function getTotalHeightOfBlockList(blockList) {
  let height = 0;
  blockList.blocks.forEach((block) => {
    height += block.elem.offsetHeight;
  });
  return height;
}

/**
 * @param {BlockList} blockList 
 * @returns {number}
 */
function getTotalWidthOfBlockList(blockList) {
  let hightestWidth = 0;
  blockList.blocks.forEach((block) => {
    const totalBlockWidth =
      block.indentation * block.indentationWidth + block.elem.offsetWidth;
    hightestWidth = Math.max(hightestWidth, totalBlockWidth);
  });
  return hightestWidth;
}

/**
 * @param {BlockList} blockList 
 * @returns {number}
 */
function getTotalWidthOfIndentations(blockList) {
  let hightestWidth = 0;
  blockList.blocks.forEach((block) => {
    const totalBlockWidth = block.indentation * block.indentationWidth;
    hightestWidth = Math.max(hightestWidth, totalBlockWidth);
  });
  return hightestWidth;
}

/**
 * @param {BlockList} blockList 
 * @returns {Block}
 */
function findLastClickedBlock(blockList) {
  let lastBlock = null;
  let lastClick = 0;
  blockList.blocks.forEach((block, i) => {
    if (block.lastClick > lastClick) {
      lastClick = block.lastClick;
      lastBlock = block;
    }
    block.getAllNestedBlocks().forEach((nestedBlock) => {
      if (nestedBlock.lastClick <= lastClick) return;
      lastClick = nestedBlock.lastClick;
      lastBlock = nestedBlock;
    });
  });
  return lastBlock;
}


/**
 * @param {BlockList} blockList 
 * @param {Block} block 
 * @returns {Block}
 */
function getConnectedDubbleBlock(blockList, block) {
  const dubbleBlockId = blockIds[block.dubbleBlock];
  const blockNum = blockList.blocks.indexOf(block);
  let depth = 0;
  if (block.isFirstDubbleBlock) {
    for (let i = blockNum + 1; i < blockList.blocks.length; i++) {
      if (blockList.blocks[i].blockId == dubbleBlockId) {
        if (depth == 0) return blockList.blocks[i];
        depth--;
      } else if (blockList.blocks[i].blockId == block.blockId) depth++;
    }
  } else {
    for (let i = blockNum - 1; i >= 0; i--) {
      if (blockList.blocks[i].blockId == dubbleBlockId) {
        if (depth == 0) return blockList.blocks[i];
        depth--;
      } else if (blockList.blocks[i].blockId == block.blockId) depth++;
    }
  }
  console.log("Failed to find conneced dubble block...");
}


/**
 * 
 * @param {compiledBlockList} compiledBlockList 
 * @param {number} blockNum 
 * @returns {number}
 */
function getCompiledConnectedDubbleBlock(compiledBlockList, blockNum) {
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
