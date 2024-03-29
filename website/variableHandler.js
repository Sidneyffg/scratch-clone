class VariableHandler {
  constructor() {
    this.popupElem = document.getElementById("new-variable-popup");
    this.popupAddElem = document.getElementById("new-variable-popup-add");
    this.popupCloseElem = document.getElementById("new-variable-popup-close");
    this.popupNameElem = document.getElementById("new-variable-popup-name");
    this.popupAddElem.addEventListener("click", () => {
      const name = this.popupNameElem.value.trim();
      if (!name || this.publicVariables[name] != undefined) return;
      this.addVariable(name);
      this.popupOpenedBy.reloadVariableSelect();
      Array.from(this.popupOpenedBy.variableElem.children).find(
        (e) => e.value == name
      ).selected = true;
      this.resetAndHidePopup();
    });
    this.popupCloseElem.addEventListener("click", () => {
      this.popupOpenedBy.variableElem.value = "";
      this.resetAndHidePopup();
    });

    this.publicVariables["std var"] = "0";
    this.setOptions();
  }

  /**
   * @param {string} name
   */
  addVariable(name) {
    this.publicVariables[name] = "0";
    this.addBlockTemplate(name);
    blockDisplay.reload();
    this.setOptions();
  }
  /**
   * @param {string} name
   */
  addBlockTemplate(name) {
    const blockTemplate = {
      blockId: blockTemplates.length,
      content: [name],
      color: "orange",
      canConnectBottom: false,
      canConnectTop: false,
      isDubbleBlock: false,
      isInputBlock: true,
      variableName: name,
      getValue() {
        return variableHandler.publicVariables[this.variableName];
      },
    };
    blockTemplates.push(blockTemplate);
  }

  resetVariables() {
    for (const variable in this.publicVariables) {
      this.publicVariables[variable] = "0";
    }
  }

  resetAndHidePopup() {
    this.popupElem.style.display = "none";
    this.popupNameElem.value = "";
    this.popupOpenedBy = null;
  }

  /**
   * @param {Block} block
   */
  openNewVariablePopup(block) {
    this.popupElem.style.display = "block";
    this.popupOpenedBy = block;
  }

  setOptions() {
    let options = `<option hidden></option>`;
    for (const publicVariable in this.publicVariables) {
      options += `<option>${publicVariable}</option>`;
    }
    options += `<option>New variable</option>`;
    this.options = options;
  }

  publicVariables = {};
  options;
  popupOpenedBy;
}
