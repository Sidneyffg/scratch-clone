class BlockInput {
  constructor(type, elem, content = "") {
    this.type = type;
    this.content = content;
    this.elem = elem;
    this.elem.addEventListener("keyup", (e) =>
      this.updateContent(e.value, true)
    );
  }

  updateContent(newContent, hasChanged = false) {
    console.log("updateContent")
    if (typeof newContent == "string") return (this.content = newContent);
  }
  type = null;
  content;
}
