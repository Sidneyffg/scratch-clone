class BlockInput {
  constructor(type, elem, content = "") {
    this.type = type;
    this.content = content;
    this.elem = elem;
    this.elem.addEventListener("keyup", () =>
      this.updateContent(this.elem.value, true)
    );
    this.elem.addEventListener("focusout", () => {
      this.updateContent(this.elem.value, true);
    });
  }

  updateContent(newContent, hasChanged = false) {
    if (typeof newContent == "string") {
      if (this.type == "number") this.content = parseInt(newContent);
      else this.content = newContent;
      return;
    }
  }
  type = null;
  content;
}
