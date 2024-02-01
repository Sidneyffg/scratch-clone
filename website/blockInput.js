class BlockInput {
  constructor(type, elem, content = "") {
    this.type = type;
    this.content = content;
    this.elem = elem;
    this.elem.addEventListener("keydown", (e) => {
      if (e.key.length != 1) return;
      this.updateContent(this.elem.innerHTML + e.key, e);
    });
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
    }
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
