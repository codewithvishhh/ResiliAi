import { test, expect } from "@playwright/test";
import { BasePage } from "../pages/BasePage";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";

test.describe("Subsystem: System Reliability, Error & Network Integrity", () => {
  let basePage: BasePage;
  let authPage: AuthPage;
  let navPage: NavPage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    authPage = new AuthPage(page);
    navPage = new NavPage(page);
  });

  test("6.1 should produce zero uncaught console errors on initial unauthenticated landing", async ({ page }) => {
    await authPage.clearSession();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Filter out third-party/firebase analytics network warnings if any
    basePage.assertZeroConsoleErrors([
      /favicon/i,
      /Download the React DevTools/i,
    ]);
  });

  test("6.2 should systematically traverse all modules with zero console errors or failed requests", async ({ page }) => {
    await authPage.clearSession();
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();

    const tabs: ("Overview" | "Risk map" | "Alerts" | "Community" | "Command center" | "Assistant" | "About")[] = [
      "Overview",
      "Risk map",
      "Alerts",
      "Community",
      "Command center",
      "Assistant",
      "About"
    ];

    for (const tab of tabs) {
      await navPage.selectTab(tab);
      await page.waitForTimeout(400);
    }

    // Verify zero fatal console errors occurred during the entire walkthrough
    basePage.assertZeroConsoleErrors([
      /favicon/i,
      /Download the React DevTools/i,
      /ResizeObserver/i, // benign animation observer warning
    ]);

    // Verify zero critical internal network failures (500s or dropped requests)
    basePage.assertZeroFailedNetworkRequests([
      /favicon\.ico/i,
    ]);
  });
});
