function dragElement(elem, blockList) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const parent = elem.parentElement;

  elem.onmousedown = dragMouseDown;
  let lastClickedBlock = null;

  function dragMouseDown(e) {
    lastClickedBlock = findLastClickedBlock(blockList);
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    if (lastClickedBlock > 0) {
      blockList.releaseFromBlockList(lastClickedBlock);
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
    top = Math.min(Math.max(top, 0), parent.offsetHeight - elem.offsetHeight);
    left = Math.min(Math.max(left, 0), parent.offsetWidth - elem.offsetWidth);
    elem.style.top = top + "px";
    elem.style.left = left + "px";
    blockList.x = left;
    blockList.y = top;
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (!blockList.blocks[0].canConnectTop) return;
    for (let i = 0; i < blockListHandler.blockLists.length; i++) {
      const otherBlockList = blockListHandler.blockLists[i];
      if (!otherBlockList.blocks.lastElement().canConnectBottom) continue;
      if (blockList == otherBlockList) continue;
      const hoveringNum = isHoveringOverBlocklist(blockList, otherBlockList);
      if (hoveringNum === false) continue;
      blockListHandler.mergeBlockLists(otherBlockList, blockList, hoveringNum);
      return;
    }
  }
}

const snapDistanceX = 60;
function isHoveringOverBlocklist(selected, other) {
  const otherHeight = getTotalHeightOfBlockList(other);
  const firstSnapDistanceY = other.blocks[0].elem.offsetHeight / 2;
  if (
    selected.x > other.x - snapDistanceX &&
    selected.x < other.x + snapDistanceX &&
    selected.y > other.y + firstSnapDistanceY &&
    selected.y < other.y + firstSnapDistanceY + otherHeight
  ) {
    let passedHeight = 0;
    const heightFromTop = selected.y - other.y;
    for (let i = 0; i < other.blocks.length; i++) {
      const block = other.blocks[i];
      const blockHeight = block.elem.offsetHeight;
      const snapDistanceY = blockHeight / 2;
      passedHeight += snapDistanceY;
      if (
        passedHeight <= heightFromTop &&
        passedHeight + 2 * snapDistanceY >= heightFromTop
      )
        return i + 1;
      passedHeight += snapDistanceY;
    }
    console.log("failed to get hovering over block num");
  }
  return false;
}

function getTotalHeightOfBlockList(blockList) {
  let height = 0;
  blockList.blocks.forEach((block) => {
    height += block.elem.offsetHeight;
  });
  return height;
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
