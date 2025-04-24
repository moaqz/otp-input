import { test, expect } from "@playwright/test";

test.beforeEach("register otp-input component", async ({ page }) => {
  await page.setContent(`
    <otp-input>
      <input type="text" inputmode="numeric" maxlength="1">
      <input type="text" inputmode="numeric" maxlength="1">
      <input type="text" inputmode="numeric" maxlength="1">
      <input type="text" inputmode="numeric" maxlength="1">
      <input type="text" inputmode="numeric" maxlength="1">
      <input type="text" inputmode="numeric" maxlength="1">
    </otp-input>
  `);

  await page.addScriptTag({
    path: "dist/index.mjs",
    type: "module",
  });
});

test.describe("Focus behavior", () => {
  test("should focus the first non-empty input when the component is clicked outside of an input", async ({ page, browserName }) => {
    test.fixme(browserName === "webkit", "This feature breaks in Safari for some reason");

    await page.locator("otp-input").click();

    const inputs = page.locator("otp-input > input");

    expect(inputs.first()).toBeFocused();
  });

  test("should move the focus to next input after inserting a valid digit", async ({ page }) => {
    const inputs = page.locator("otp-input > input");

    await inputs.first().fill("1");
    await expect(inputs.first()).toHaveValue("1");

    expect(inputs.nth(1)).toBeFocused();
  });

  test("should not move focus to the next input when deleting a character", async ({ page }) => {
    const inputs = page.locator("otp-input > input");

    await inputs.first().fill("1");
    await expect(inputs.nth(1)).toBeFocused();

    // Refocus the first input.
    await inputs.first().focus();

    await inputs.first().press("Backspace");
    await expect(inputs.nth(1)).not.toBeFocused();
    await expect(inputs.first()).toBeFocused();
  });
});

test.describe("Input validation", () => {
  test("should ignore non-digit characters during typing", async ({ page }) => {
    const inputs = page.locator("otp-input > input");

    await inputs.first().type("a");
    expect(inputs.first()).toHaveValue("");

    await inputs.first().type("#");
    expect(inputs.first()).toHaveValue("");
  });

  test.skip("should populate all inputs when pasting a complete OTP code", async ({ page, context }) => {
    const CODE = "123456";
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // TODO: Fix this test to work in non-secure contexts or ensure it runs in a secure context.
    await page.evaluate(() => navigator.clipboard.writeText(CODE));

    const inputs = page.locator("otp-input > input");
    await inputs.first().press("Meta+v");

    for (let i = 0; i < CODE.length; i++) {
      await expect(inputs.nth(i)).toHaveValue(CODE[i]);
    }

    await expect(inputs.last()).toBeFocused();
  });

  test("should overwrite the current value when typing a different character", async ({ page }) => {
    const inputs = page.locator("otp-input > input");

    await inputs.first().fill("1");
    await expect(inputs.first()).toHaveValue("1");

    await inputs.first().focus();
    await inputs.first().fill("2");

    await expect(inputs.first()).toHaveValue("2");
    await expect(inputs.nth(1)).toBeFocused();
  });
});
