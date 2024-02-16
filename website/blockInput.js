class BlockInput {
  /**
   * @param {Block} parent
   * @param {blockInputType} type
   * @param {HTMLElement} elem
   * @param {blockInputContent} [content]
   */
  constructor(parent, type, elem, content = "") {
    this.parent = parent;
    this.type = type;
    this.content = content;
    this.elem = elem;
    this.elem.addEventListener("keydown", (e) => {
      if (typeof this.content == "object") return;
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

  /**
   * @param {Block} block
   */
  addBlockToInput(block) {
    this.elem.innerHTML = "";
    this.elem.appendChild(block.elem);
    block.parent = this.parent;
    this.updateContent(block);
  }

  /**
   * @param {BlockList} blockList
   * @returns {boolean}
   */
  canSnap(blockList) {
    const parentBlockList = this.parent.parentBlockList;
    const x = this.elem.offsetLeft + parentBlockList.x;
    const y = this.elem.offsetTop + parentBlockList.y;
    return (
      blockList.x > x - this.snapDistance &&
      blockList.x < x + this.stdWidth &&
      blockList.y > y - this.snapDistance &&
      blockList.y < y + this.stdHeight
    );
  }

  /**
   * @param {blockInputContent} newContent
   * @param {Event} [event]
   */
  updateContent(newContent, event = null) {
    if (typeof newContent == "string") {
      if (typeof this.content != "string") {
        this.elem.contentEditable = true;
        this.elem.classList.remove("input-with-block");
      }
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
    } else if (typeof newContent == "object") {
      if (typeof this.content != "object") {
        this.elem.contentEditable = false;
        this.elem.classList.add("input-with-block");
      }
      this.content = newContent;
    }
  }
  snapDistance = 15;
  stdWidth = 30;
  stdHeight = 20;
  type = null;
  content;
}

const allowedChars = {
  float: "0123456789.",
  int: "0123456789",
  string:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVW0123456789 -+=_()*&^%$#@![]{}\\|\"':;,.<>/?`~",
};
