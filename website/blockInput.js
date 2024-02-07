class BlockInput {
  constructor(type, elem, content = "") {
    this.type = type;
    this.content = content;
    this.elem = elem;
    this.elem.addEventListener("keydown", (e) => {
      if (typeof this.content == "object") return e.preventDefault();
      if (e.key.length != 1) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
          return;
        switch (e.key) {
          case "Backspace":
            const inner = this.elem.innerHTML;
            this.updateContent(inner.substring(0, inner.length - 1), e);
            break;
          default:
            e.preventDefault();
            break;
        }
        return;
      }
      this.updateContent(this.elem.innerHTML + e.key, e);
    });
  }

  addBlockToInput(block) {
    this.elem.innerHTML = "";
    this.elem.appendChild(block.elem);
    this.elem.classList.add("input-with-block");
    this.updateContent(block);
  }

  updateContent(newContent, event = null) {
    if (typeof newContent == "string") {
      for (let i = 0; i < newContent.length; i++) {
        if (!allowedChars[this.type].includes(newContent[i]))
          return event.preventDefault();
      }
      if (this.type == "number") {
        this.content = parseInt(newContent);
        if (true) {
        }
      } else this.content = newContent;
      return;
    } else if (typeof newContent == "object") this.content = newContent;
  }
  type = null;
  content;
}

const allowedChars = {
  float: "0123456789.",
  int: "0123456789",
  string:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVW0123456789 -+=_()*&^%$#@![]{}\\|\"':;,.<>/?`~",
};
