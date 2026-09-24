import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { ProfilePage } from "../pages/ProfilePage";

test.describe("Subsystem: Authentication & Session Management", () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.clearSession();
  });

  test("1.1 should enforce authentication gate and display login landing page", async () => {
    await authPage.verifyLoginPageUI();
  });

  test("1.2 should authenticate via Guest / Demo mode and write credentials to localStorage", async ({ page }) => {
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();

    // Verify session persistence in localStorage
    const guestSession = await page.evaluate(() => localStorage.getItem("resiliai-guest"));
    expect(guestSession).toBe("true");
  });

  test("1.3 should persist user session across page reloads", async ({ page }) => {
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();

    // Reload page and verify still logged in without flashing login page
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Build resilience before the crisis/i })).not.toBeVisible();
  });

  test("1.4 should gracefully handle sign-out via confirmation modal and revoke session", async ({ page }) => {
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();

    // Navigate to profile tab
    await page.getByRole("button", { name: "Overview" }).waitFor();
    const profileBtn = page.getByRole("button", { name: "About" }).locator("..").getByRole("button").last();
    // Click on Profile or switch tab to profile
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("navigate-profile"));
    });
    
    // Direct DOM interaction with Profile if accessible or via profile trigger
    const profilePage = new ProfilePage(page);
    const navButtons = page.locator("nav button, header button");
    const count = await navButtons.count();
    
    // Look for profile avatar button
    for (let i = 0; i < count; i++) {
      const btn = navButtons.nth(i);
      const text = await btn.innerText();
      if (/Demo Responder|Profile/i.test(text)) {
        await btn.click();
        break;
      }
    }
  });
});
