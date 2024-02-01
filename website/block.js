class Block {
  constructor(template) {
    this.createHtmlElem(template.color);
    this.loadContent(template.content);
    this.elem.addEventListener("mousedown", () => {
      this.lastClick = Date.now();
    });
    this.canConnectBottom = template.canConnectBottom;
    this.canConnectTop = template.canConnectTop;
    this.blockId = template.blockId;
    this.isDubbleBlock = template.isDubbleBlock;
    if (this.isDubbleBlock) {
      this.dubbleBlock = template.dubbleBlock;
      this.isFirstDubbleBlock = template.isFirstDubbleBlock;
    }
  }
  lastClick = 0;
  createHtmlElem(color) {
    const elem = document.createElement("div");
    elem.classList.add("block");
    elem.style.backgroundColor = color;
    this.elem = elem;
  }

  indentation = 0;
  indentationWidth = 20;
  updateIndentation(indentation) {
    this.elem.style.marginLeft = indentation * this.indentationWidth + "px";
    this.indentation = indentation;
  }

  loadContent(content) {
    this.elem.innerHTML = "";
    this.inputs = [];
    this.variable = null;
    content.forEach((e) => {
      if (typeof e == "string") {
        const elem = createElem("span", { innerHTML: e });
        this.elem.appendChild(elem);
      }
      switch (e.element) {
        case "input":
          if (e.type == "variable") {
            const elem = createElem("select");
            elem.addEventListener("click", (e) => {
              if (e.pointerId != 1) {
                if (elem.value != "New variable") return;
                variableHandler.openNewVariablePopup(this);
                return;
              }
              this.reloadVariableSelect();
            });
            this.variableElem = elem;
            this.reloadVariableSelect();
            this.elem.appendChild(elem);
          } else {
            const elem = createElem("span", {
              role: "textbox",
              contentEditable: true,
              classList: "input",
            });
            this.elem.appendChild(elem);
            this.inputs.push(new BlockInput(e.type, elem));
          }
          break;
        case "img":
          //blockHtml += `<img src="${e.src}">`;
          break;
      }
    });
  }

  reloadVariableSelect() {
    const selectedOption = this.variableElem.value;
    this.variableElem.innerHTML = variableHandler.options;
    if (variableHandler.publicVariables[selectedOption] !== undefined)
      this.variableElem.value = selectedOption;
  }
  inputs;
  variableElem;
}
