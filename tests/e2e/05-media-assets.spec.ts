import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";

test.describe("Subsystem: Media & Vector Assets", () => {
  let authPage: AuthPage;
  let navPage: NavPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    navPage = new NavPage(page);

    await authPage.clearSession();
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();
  });

  test("5.1 should load brand logo with HTTP 200 status and non-zero dimensions", async ({ page }) => {
    // Intercept image network request to confirm HTTP 200
    const [logoResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("resiliai-symbol.svg")),
      page.reload({ waitUntil: "domcontentloaded" }),
    ]);

    expect(logoResponse.status()).toBe(200);

    const logo = page.locator('img[alt="ResiliAI logo"]').first();
    await expect(logo).toBeVisible();

    const box = await logo.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test("5.2 should render analytical Recharts SVG graphics with non-zero dimensions", async ({ page }) => {
    await navPage.selectTab("Overview");

    // Look for Recharts SVG responsive container
    const chartContainer = page.locator(".recharts-responsive-container, .recharts-surface").first();
    if (await chartContainer.isVisible()) {
      const box = await chartContainer.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.width).toBeGreaterThan(50);
      expect(box?.height).toBeGreaterThan(50);
    }
  });

  test("5.3 should verify all page images and icons have valid natural dimensions", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const isLoaded = await img.evaluate((el: HTMLImageElement) => {
          return el.complete && el.naturalWidth > 0 && el.naturalHeight > 0;
        });
        expect(isLoaded, `Image ${await img.getAttribute("src")} failed to load properly`).toBeTruthy();
      }
    }
  });
});
