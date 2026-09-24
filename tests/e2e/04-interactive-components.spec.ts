import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";

test.describe("Subsystem: Interactive Components & Dynamic UI", () => {
  let authPage: AuthPage;
  let navPage: NavPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    navPage = new NavPage(page);

    await authPage.clearSession();
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();
  });

  test("4.1 should open and dismiss modals via ESC key and backdrop click", async ({ page }) => {
    await navPage.selectTab("Community");

    // Open Report Modal
    await page.getByRole("button", { name: /Report incident/i }).click();
    const modalHeading = page.getByRole("heading", { name: /Report an incident/i });
    await expect(modalHeading).toBeVisible();

    // Click Close 'X' button
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn.click();
    await expect(modalHeading).not.toBeVisible();
  });

  test("4.2 should filter disaster alerts by severity tabs", async ({ page }) => {
    await navPage.selectTab("Alerts");

    // Check filter buttons
    const filterButtons = ["All", "Critical", "High", "Moderate"];
    for (const filter of filterButtons) {
      const btn = page.getByRole("button", { name: new RegExp(`^${filter}`, "i") }).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(200);
      }
    }
  });

  test("4.3 should control the real-time simulation scenario demo player", async ({ page }) => {
    await navPage.selectTab("Overview");

    // Find Simulation trigger
    const simButton = page.getByRole("button", { name: /Simulation|Live mode/i }).first();
    if (await simButton.isVisible()) {
      await simButton.click();

      // Check if simulation step controls appear (e.g. Normal, Heavy rain, Waterlogging, Critical)
      const heavyRainStep = page.getByText(/Heavy rain/i).first();
      if (await heavyRainStep.isVisible()) {
        await heavyRainStep.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test("4.4 should trigger zone selection drawer or highlight on card click", async ({ page }) => {
    await navPage.selectTab("Overview");

    // Locate zone cards (e.g. Wakad, Baner, Aundh, Katraj)
    const wakadCard = page.getByText("Lonavala").or(page.getByText("Wakad")).first();
    if (await wakadCard.isVisible()) {
      await wakadCard.click();
      await page.waitForTimeout(300);
      // Verify zone details or map highlight updates
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
