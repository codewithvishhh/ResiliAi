import { test, expect } from "@playwright/test";
import { AuthPage } from "../pages/AuthPage";
import { NavPage } from "../pages/NavPage";
import { CommunityPage } from "../pages/CommunityPage";

test.describe("Subsystem: Forms & User Inputs", () => {
  let authPage: AuthPage;
  let navPage: NavPage;
  let communityPage: CommunityPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    navPage = new NavPage(page);
    communityPage = new CommunityPage(page);

    await authPage.clearSession();
    await authPage.loginAsGuest();
    await authPage.verifyRedirectToDashboard();
  });

  test("3.1 should open Incident Report form and validate interactive category selection", async ({ page }) => {
    await navPage.selectTab("Community");
    await communityPage.openIncidentModal();

    // Verify incident type options are clickable
    const incidentTypes = ["Flood", "Waterlogging", "Road block", "Fallen tree", "Landslide", "Fire"];
    for (const type of incidentTypes) {
      const typeBtn = page.getByRole("button", { name: type, exact: true });
      await expect(typeBtn).toBeVisible();
      await typeBtn.click();
    }
  });

  test("3.2 should fill and submit an incident report with custom inputs and verify feed update", async () => {
    await navPage.selectTab("Community");
    await communityPage.openIncidentModal();

    const testArea = "Sinhagad Road Sector 4";
    const testDesc = "High water buildup near canal bridge. Pedestrians unable to cross.";

    await communityPage.submitIncident("Waterlogging", testArea, testDesc);

    // Verify newly reported incident is rendered in the community feed
    await communityPage.verifyReportInFeed(testArea);
  });

  test("3.3 should handle edge-case: empty/blank fields with sensible defaults", async ({ page }) => {
    await navPage.selectTab("Community");
    await communityPage.openIncidentModal();

    // Clear area and description
    await communityPage.areaInput.fill("");
    await communityPage.descriptionInput.fill("");
    await communityPage.submitReportBtn.click();

    // Application uses graceful fallback ("Pune Local") without crashing
    await expect(communityPage.successCheckmark).toBeVisible();
    await communityPage.closeSuccessBtn.click();

    await expect(page.getByText(/Pune Local|Reported/i).first()).toBeVisible();
  });

  test("3.4 should support conversational inputs in AI Assistant search/prompt bar", async ({ page }) => {
    await navPage.selectTab("Assistant");

    const promptInput = page.getByPlaceholder(/Ask about flood risks, safe evacuation routes/i);
    await expect(promptInput).toBeVisible();

    const queryText = "What is the safest evacuation route from Wakad?";
    await promptInput.fill(queryText);
    expect(await promptInput.inputValue()).toBe(queryText);

    // Click submit/send icon
    const sendButton = promptInput.locator("..").locator("button").last();
    if (await sendButton.isVisible()) {
      await sendButton.click();
      // Input should be processed and cleared or added to message log
      await page.waitForTimeout(500);
      await expect(page.getByText(queryText).first()).toBeVisible();
    }
  });
});
