import { test, expect, chromium, Page } from "@playwright/test";
import { readFileSync } from "fs";

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expirationDate: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
}

// Test for opening a logged-in Tokopedia session
test.describe("Tokopedia Login Test", () => {
  // Load and convert cookies from session file (assuming session.json is in the test directory)
  async function loadCookies(): Promise<Cookie[]> {
    try {
      const data = readFileSync("session.json", "utf-8");
      return JSON.parse(data) as Cookie[];
    } catch (error) {
      console.error("Error reading session.json:", error);
      return [];
    }
  }

  test("Open logged-in Tokopedia session", async ({ browser }) => {
    const context = await browser.newContext();
    const cookies = await loadCookies();

    // Set cookies from loaded data using a loop
    for (const cookie of cookies) {
      await context.addCookies([
        {
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expirationDate, // Assuming expirationDate is used in session.json
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: "None",
        },
      ]);
    }

    const page: Page = await context.newPage();
    await page.goto("https://www.tokopedia.com");

    // Wait for either username confirmation or login redirect
    await Promise.race([
      expect(page.getByText("Suwar")).toBeVisible({ timeout: 15000 }),
    ]);
  });
});
