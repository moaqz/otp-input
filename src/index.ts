class OTPInput extends HTMLElement {
  private _controller = new AbortController();

  public connectedCallback() {
    this.addEventListener("input", this.handleChange, { signal: this._controller.signal });
    this.addEventListener("beforeinput", this.handleInputChange, { signal: this._controller.signal });
    this.addEventListener("click", this.handleClick, { signal: this._controller.signal });
  }

  public disconnectedCallback() {
    this._controller.abort();
  }

  private handleClick(event: MouseEvent) {
    if (event.target !== this) {
      return;
    }

    const inputs = this.querySelectorAll<HTMLInputElement>("input");
    for (const input of inputs) {
      if (input && input.value.length === 0) {
        input.focus();
        return;
      }
    }

    // Focus on the last input when all are filled.
    inputs[inputs.length - 1].focus();
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

    const nextInput = target.nextElementSibling;
    const wasBackspaced = event.inputType === "deleteContentBackward";
    if (
      nextInput &&
      nextInput instanceof HTMLInputElement &&
      // Avoid moving focus to the next input when deleting characters using backspace.
      !wasBackspaced
    ) {
      nextInput.focus();
    }
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

    let currentEl = event.target as HTMLInputElement | null;
    let lastFilled: HTMLInputElement | null = null;

    for (const char of event.data) {
      if (!currentEl || !(currentEl instanceof HTMLInputElement)) {
        break;
      }

      currentEl.value = char;
      lastFilled = currentEl;
      currentEl = currentEl.nextElementSibling as HTMLInputElement | null;
    }

    lastFilled?.focus();
  }

  private isDigit(v: string): boolean {
    return /^\d$/.test(v);
  }

  private handleInsertTextInput(event: InputEvent) {
    const char = event.data;
    if (!char) {
      event.preventDefault();
      return;
    }

    if (!this.isDigit(char)) {
      event.preventDefault();
    }
  }

  private handleBackspaceInput(event: InputEvent) {
    const target = event.target;
    if (!target || !(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.value.length !== 0) {
      return;
    }

    const prevInput = target.previousElementSibling;
    if (!prevInput || !(prevInput instanceof HTMLInputElement)) {
      return;
    }

    prevInput.focus();
  }
}

customElements.define("otp-input", OTPInput);
