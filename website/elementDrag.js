const blockHeight = 40;

function dragElement(elem, blockList) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  const parent = elem.parentElement;
  if (document.getElementById(elem.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elem.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elem.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e.preventDefault();
    const lastClickedBlock = findLastClickedBlock(blockList);
    if (lastClickedBlock != 0) {
      blockList.releaseFromBlockList(lastClickedBlock);
    }
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
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

    for (let i = 0; i < blockListHandler.blockLists.length; i++) {
      const otherBlockList = blockListHandler.blockLists[i];
      if (blockList == otherBlockList) continue;
      const hoveringNum = isHoveringOverBlocklist(blockList, otherBlockList);
      if (hoveringNum === false) continue;
      blockListHandler.mergeBlockLists(otherBlockList, blockList, hoveringNum);
      return;
    }
  }
}

const snapDistanceY = blockHeight / 2;
function isHoveringOverBlocklist(selected, other) {
  const otherHeight = other.blocks.length * 40;
  if (
    selected.x > other.x - 40 &&
    selected.x < other.x + 70 &&
    selected.y > other.y + snapDistanceY &&
    selected.y < other.y + snapDistanceY + otherHeight
  ) {
    const heightFromTop = selected.y - other.y - snapDistanceY;
    return Math.floor(heightFromTop / blockHeight) + 1;
  }
  return false;
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
