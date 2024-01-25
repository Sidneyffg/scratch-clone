class Block {
  constructor(template) {
    this.createHtmlElem(template.color);
    this.loadContent(template.content);
    this.elem.addEventListener("mousedown", () => {
      this.lastClick = Date.now();
    });
    this.canConnectBottom = template.canConnectBottom;
    this.canConnectTop = template.canConnectTop;
    this.elem.style.height =
      (Math.floor(Math.random() * 100) + 40).toString() + "px";
  }
  lastClick = 0;
  createHtmlElem(color) {
    const elem = document.createElement("div");
    elem.classList.add("block");
    elem.style.backgroundColor = color;
    this.elem = elem;
  }

  loadContent(content) {
    this.elem.innerHTML = "";
    this.inputs = [];
    content.forEach((e) => {
      if (typeof e == "string") {
        const elem = createElem("span", { innerHTML: e });
        this.elem.appendChild(elem);
      }
      switch (e.element) {
        case "input":
          const elem = createElem("input", { type: e.type });
          this.elem.appendChild(elem);
          this.inputs.push(new BlockInput(e.type, elem));
          break;
        case "img":
          //blockHtml += `<img src="${e.src}">`;
          break;
      }
    });
  }
  inputs;
}
