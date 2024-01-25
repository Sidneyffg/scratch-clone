function dragElement(elem) {
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
    const top = elem.offsetTop - pos2;
    const left = elem.offsetLeft - pos1;
    elem.style.top =
      Math.min(Math.max(top, 0), parent.offsetHeight - elem.offsetHeight) +
      "px";
      elem.style.left =
      Math.min(Math.max(left, 0), parent.offsetWidth - elem.offsetWidth) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
