const playField = document.getElementById("play-field")

class Block {
    constructor(type){
        this.createHtmlElem();
    }

    createHtmlElem(){
        const elem = document.createElement("div");
        elem.classList.add("block")
        this.elem = elem;
    }
}

class BlockList {
  constructor(){
    this.createElem()
    this.addBlock();
  }

  addBlock() {
    const newBlock = new Block();
    this.elem.appendChild(newBlock.elem);
    this.blocks.push(newBlock)
  }

  createElem() {
    const elem = document.createElement("div");
    elem.classList.add("block-list")
    playField.appendChild(elem);
    dragElement(elem);
    this.elem = elem;
  }
  blocks = [];
}
const blockList = new BlockList()

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const elem = elmnt;
  const parent = elmnt.parentElement;
  console.log(parent)
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e.preventDefault();
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
    const top = elmnt.offsetTop - pos2
    const left = elmnt.offsetLeft - pos1
    elmnt.style.top = Math.min(Math.max((top),0),parent.offsetHeight-elem.offsetHeight) + "px";
    elmnt.style.left = Math.min(Math.max((left),0),parent.offsetWidth-elem.offsetWidth) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}