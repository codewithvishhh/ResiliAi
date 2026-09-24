import { Page, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly consoleErrors: string[] = [];
  readonly failedRequests: { url: string; status?: number; errorText?: string }[] = [];

  constructor(page: Page) {
    this.page = page;

    // Attach listeners for uncaught browser errors and failed network calls
    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        this.consoleErrors.push(msg.text());
      }
    });

    this.page.on("pageerror", (error) => {
      this.consoleErrors.push(error.message);
    });

    this.page.on("requestfailed", (request) => {
      // Exclude optional 3rd-party analytics or external optional tile fallbacks if needed
      const url = request.url();
      const failure = request.failure();
      this.failedRequests.push({
        url,
        errorText: failure?.errorText || "Unknown error",
      });
    });

    this.page.on("response", (response) => {
      if (response.status() >= 400 && response.status() !== 404) {
        // Track 500s or unexpected internal errors
        this.failedRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });
  }

  async navigateTo(path: string = "/") {
    const response = await this.page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
  }

  assertZeroConsoleErrors(allowPatterns: RegExp[] = []) {
    const filtered = this.consoleErrors.filter((msg) => {
      return !allowPatterns.some((pattern) => pattern.test(msg));
    });
    expect(filtered, `Expected 0 uncaught console errors, but found:\n${filtered.join("\n")}`).toHaveLength(0);
  }

  assertZeroFailedNetworkRequests(allowUrls: RegExp[] = []) {
    const filtered = this.failedRequests.filter((req) => {
      return !allowUrls.some((pattern) => pattern.test(req.url));
    });
    expect(filtered, `Expected no failed critical requests, but found:\n${JSON.stringify(filtered, null, 2)}`).toHaveLength(0);
  }

  async verifyImageLoaded(selector: string) {
    const img = this.page.locator(selector).first();
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
    expect(naturalWidth).toBeGreaterThan(0);
    expect(naturalHeight).toBeGreaterThan(0);
  }
}
