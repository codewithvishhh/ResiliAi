import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";

test.describe("Subsystem: Navigation & Routing", () => {
  let authPage: AuthPage;
  let navPage: NavPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    navPage = new NavPage(page);
    await authPage.clearSession();
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();
  });

  test("2.1 should render branding header and verified logo asset", async () => {
    await navPage.verifyBrandHeader();
  });

  test("2.2 should systematically route across all major application views without errors", async ({ page }) => {
    // 1. Overview Tab
    await navPage.selectTab("Overview");
    await expect(page.getByText(/Disaster Resilience Overview|Regional Risk Index|Live monitoring/i).first()).toBeVisible();

    // 2. Risk Map Tab
    await navPage.selectTab("Risk map");
    await expect(page.getByText(/Interactive Risk Map|Western Maharashtra Basin|Active hazard layers/i).first()).toBeVisible();

    // 3. Alerts Tab
    await navPage.selectTab("Alerts");
    await expect(page.getByText(/Active alerts|Disaster advisories/i).first()).toBeVisible();

    // 4. Community Tab
    await navPage.selectTab("Community");
    await expect(page.getByText(/Community intelligence|Live crowdsourced hazard reports/i).first()).toBeVisible();

    // 5. Command Center Tab
    await navPage.selectTab("Command center");
    await expect(page.getByText(/Incident Command System|Command center|Resource Allocation/i).first()).toBeVisible();

    // 6. Assistant Tab
    await navPage.selectTab("Assistant");
    await expect(page.getByText(/Resilience Assistant|Ask about flood risks|AI Assistant/i).first()).toBeVisible();

    // 7. About Tab
    await navPage.selectTab("About");
    await expect(page.getByText(/About ResiliAI|System Architecture|Emergency Contacts/i).first()).toBeVisible();
  });

  test("2.3 should provide responsive mobile navigation and drawer triggers", async ({ page }) => {
    // Resize viewport to mobile dimensions
    await page.setViewportSize({ width: 375, height: 667 });

    // Floating Report button on mobile should be visible
    const mobileReportBtn = page.getByRole("button", { name: /Report/i }).last();
    await expect(mobileReportBtn).toBeVisible();

    // Clicking Report button routes to Community page modal
    await mobileReportBtn.click();
    await expect(page.getByText(/Community intelligence/i)).toBeVisible();
  });
});
