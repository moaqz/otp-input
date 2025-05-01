> [!IMPORTANT]
> The library is under active development. Some features may not be fully implemented or may change in future versions.

# OTP Input Component

<https://github.com/user-attachments/assets/ba709131-6da1-4840-95a1-6c787deae9a4>

![License](https://badgen.net/github/license/moaqz/otp-input)
![npm version](https://badgen.net/npm/v/@moaqzdev/otp-input)
![bundle size](https://img.shields.io/bundlejs/size/@moaqzdev/otp-input)

## How it works

Unlike other libraries, this component does not render inputs or enforce styles. It simply adds OTP interaction logic to your existing fields.

To use it, just wrap your input fields inside the custom element:

```diff
+<otp-input>
  <input type="text" maxlength="1" inputmode="numeric" aria-label="Please enter OTP character 1" />
  <input type="text" maxlength="1" inputmode="numeric" aria-label="Please enter OTP character 2" />
  <input type="text" maxlength="1" inputmode="numeric" aria-label="Please enter OTP character 3" />
  <input type="text" maxlength="1" inputmode="numeric" aria-label="Please enter OTP character 4" />
+</otp-input>
```

You keep full control over the markup and styling, the component only adds the interaction logic.

## Usage

```bash
pnpm add @moaqzdev/otp-input
```

Import the component in your JavaScript entry point:

```diff
+ // Optional: Import a theme
+ // import "@moaqzdev/otp-input/themes/default";
+import "@moaqzdev/otp-input";
```

Use it in your HTML:

```diff
+<otp-input>
  <input ... aria-label="Please enter OTP character 1" />
  <input ... aria-label="Please enter OTP character 2" />
  ...
+</otp-input>
```

## License

Published under the [MIT](https://github.com/moaqz/otp-input/blob/main/LICENSE) license.
