class OTPInput extends HTMLElement {
  static formAssociated = true;
  private _controller = new AbortController();
  private _internals: ElementInternals;
  private _fields: HTMLInputElement[] = [];

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  static get observedAttributes() {
    return ["disabled"];
  }

  public attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "disabled") {
      this._fields.forEach((field) => { field.disabled = newValue !== null; });
    }
  }

  public connectedCallback() {
    this._fields = Array.from(this.querySelectorAll<HTMLInputElement>("input"));

    if (this.hasAttribute("disabled")) {
      this._fields.forEach(field => { field.disabled = true; });
    }

    this.addEventListener("input", this.handleChange, { signal: this._controller.signal });
    this.addEventListener("beforeinput", this.handleInputChange, { signal: this._controller.signal });
    this.addEventListener("click", this.handleClick, { signal: this._controller.signal });
    this.addEventListener("keydown", this.handleKeydown, { signal: this._controller.signal });
  }

  public disconnectedCallback() {
    this._controller.abort();
  }

  private getCurrentFieldIndex(target: HTMLInputElement): number {
    return this._fields.indexOf(target);
  }

  private handleKeydown(event: KeyboardEvent) {
    const { target, key } = event;
    if (!target || !(target instanceof HTMLInputElement)) {
      return;
    };

    const currentFieldIdx = this.getCurrentFieldIndex(target);
    if (key === "ArrowLeft" && currentFieldIdx > 0) {
      this._fields[currentFieldIdx - 1].focus();
      event.preventDefault();
    } else if (key === "ArrowRight" && currentFieldIdx < this._fields.length - 1) {
      this._fields[currentFieldIdx + 1].focus();
      event.preventDefault();
    }
  }

  private handleClick(event: MouseEvent) {
    if (event.target !== this) {
      return;
    }

    for (const field of this._fields) {
      if (field && field.value.length === 0) {
        field.focus();
        return;
      }
    }

    // Focus on the last input when all are filled.
    this._fields[this._fields.length - 1].focus();
  }

  private handleInputChange(event: InputEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType
    if (event.inputType === "insertText") {
      this.handleInsertTextInput(event);
    } else if (event.inputType === "deleteContentBackward") {
      this.handleBackspaceInput(event);
    } else if (event.inputType === "insertFromPaste") {
      this.handlePaste(event);
    }
  }

  private handleChange(event: Event) {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) ||
      !(event instanceof InputEvent)
    ) {
      return;
    }

    const currentFieldIdx = this.getCurrentFieldIndex(target);
    const wasBackspaced = event.inputType === "deleteContentBackward";
    if (
      currentFieldIdx < this._fields.length - 1 &&
      // Avoid moving focus to the next input when deleting characters using backspace.
      !wasBackspaced
    ) {
      this._fields[currentFieldIdx + 1].focus();
    }

    this._internals.setFormValue(this.value);
  }

  private handlePaste(event: InputEvent) {
    if (event.data == null) {
      return;
    }

    // Early return if any non-digit character is found.
    for (const char of event.data) {
      if (!this.isDigit(char)) {
        event.preventDefault();
        return;
      }
    }

    event.preventDefault();

    const startIndex = this.getCurrentFieldIndex(event.target as HTMLInputElement);
    if (startIndex === -1) {
      return;
    }

    let lastFilledIndex = startIndex;
    for (let i = 0; i < event.data.length && (startIndex + i) < this._fields.length; i++) {
      const targetField = this._fields[startIndex + i];
      const char = event.data[i];

      targetField.value = char;
      lastFilledIndex = startIndex + i;
    }

    this._internals.setFormValue(this.value);
    this._fields[lastFilledIndex]?.focus();
  }

  private isDigit(v: string): boolean {
    return /^\d$/.test(v);
  }

  private handleInsertTextInput(event: InputEvent) {
    const { data: char, target } = event;
    if (
      !char ||
      !this.isDigit(char) ||
      !(target instanceof HTMLInputElement)
    ) {
      event.preventDefault();
      return;
    }

    // If the input is already filled.
    if (target.value.length !== 0) {
      const didValueChange = target.value !== char;

      event.preventDefault();

      if (didValueChange) {
        target.value = char;
        this._internals.setFormValue(this.value);
      }

      const currentFieldIdx = this.getCurrentFieldIndex(target);
      if (currentFieldIdx < this._fields.length - 1) {
        this._fields[currentFieldIdx + 1].focus();
      }
    }
  }

  private handleBackspaceInput(event: InputEvent) {
    const target = event.target;
    if (!target || !(target instanceof HTMLInputElement)) {
      return;
    }

    /**
    * Only move focus to previous field when current field is empty.
    * If current field has content, let the default backspace behavior handle it.
    */
    if (target.value.length !== 0) {
      return;
    }

    const currentFieldIdx = this.getCurrentFieldIndex(target);
    if (currentFieldIdx > 0) {
      this._fields[currentFieldIdx - 1].focus();
    }
  }

  get value(): string {
    const fields = this.querySelectorAll<HTMLInputElement>("input");

    let _value = "";
    for (const field of fields) {
      _value += field.value;
    }

    return _value;
  }
}

customElements.define("otp-input", OTPInput);
