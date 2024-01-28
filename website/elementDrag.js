function dragElement(elem, blockList) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  elem.onmousedown = dragMouseDown;
  let lastClickedBlock = null;

  function dragMouseDown(e) {
    lastClickedBlock = findLastClickedBlock(blockList);
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    if (!blockList.static) return;
    blockList.deStatic();
  }

  function elementDrag(e) {
    e.preventDefault();
    if (lastClickedBlock) {
      let selectedBlock = blockList.blocks[lastClickedBlock];
      if (selectedBlock.isDubbleBlock && !selectedBlock.isFirstDubbleBlock) {
        lastClickedBlock = getConnectedDubbleBlock(blockList, lastClickedBlock);
        selectedBlock = blockList.blocks[lastClickedBlock];
      }
      if (lastClickedBlock > 0) {
        blockList.releaseFromBlockList(lastClickedBlock);
      }
      lastClickedBlock = null;
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
    if (!blockList.blocks[0].canConnectTop) return;
    for (let i = 0; i < blockListHandler.blockLists.length; i++) {
      const otherBlockList = blockListHandler.blockLists[i];
      if (blockList == otherBlockList) continue;
      // pos of where block whill come
      const hoveringNum = isHoveringOverBlocklist(blockList, otherBlockList);
      if (hoveringNum === null) continue;
      if (!otherBlockList.blocks[hoveringNum - 1].canConnectBottom) continue;
      if (
        hoveringNum != otherBlockList.blocks.length &&
        !blockList.blocks.lastElement().canConnectBottom &&
        !isSecondDubbleBlock(otherBlockList.blocks[hoveringNum])
      )
        continue;
      blockListHandler.mergeBlockLists(otherBlockList, blockList, hoveringNum);
      return;
    }
  }
}

const snapDistanceX = 60;
function isHoveringOverBlocklist(selected, other) {
  const otherHeight = getTotalHeightOfBlockList(other);
  const otherIndentationWidth = getTotalWidthOfIndentations(other);
  const firstSnapDistanceY = other.blocks[0].elem.offsetHeight / 2;
  if (
    selected.x > other.x - snapDistanceX &&
    selected.x < other.x + snapDistanceX + otherIndentationWidth &&
    selected.y > other.y + firstSnapDistanceY &&
    selected.y < other.y + firstSnapDistanceY + otherHeight
  ) {
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
        selected.x > other.x + indentation - snapDistanceX &&
        selected.x < other.x + indentation + snapDistanceX
      ) {
        console.log("snapped");
        return i + 1;
      }
      passedHeight += snapDistanceY;
    }
  }
  return null;
}

function getTotalHeightOfBlockList(blockList) {
  let height = 0;
  blockList.blocks.forEach((block) => {
    height += block.elem.offsetHeight;
  });
  return height;
}

function getTotalWidthOfIndentations(blockList) {
  let hightestWidth = 0;
  blockList.blocks.forEach((block) => {
    const totalBlockWidth = block.indentation * block.indentationWidth;
    hightestWidth = Math.max(hightestWidth, totalBlockWidth);
  });
  return hightestWidth;
}

function findLastClickedBlock(blockList) {
  let idx = 0;
  let lastClick = 0;
  blockList.blocks.forEach((block, i) => {
    if (block.lastClick <= lastClick) return;
    lastClick = block.lastClick;
    idx = i;
  });
  return idx;
}

function getConnectedDubbleBlock(blockList, blockNum) {
  const block = blockList.blocks[blockNum];
  const dubbleBlockId = blockIds[block.dubbleBlock];
  let depth = 0;
  if (block.isFirstDubbleBlock) {
    for (let i = blockNum + 1; i < blockList.blocks.length; i++) {
      if (blockList.blocks[i].blockId == dubbleBlockId) {
        if (depth == 0) return i;
        depth--;
      } else if (blockList.blocks[i].blockId == block.blockId) depth++;
    }
  } else {
    for (let i = blockNum - 1; i >= 0; i--) {
      if (blockList.blocks[i].blockId == dubbleBlockId) {
        if (depth == 0) return i;
        depth--;
      } else if (blockList.blocks[i].blockId == block.blockId) depth++;
    }
  }
  console.log("Failed to find conneced dubble block...");
}
