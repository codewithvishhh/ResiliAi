import { Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class NavPage extends BasePage {
  readonly logoImg: Locator;
  readonly navOverview: Locator;
  readonly navMap: Locator;
  readonly navAlerts: Locator;
  readonly navCommunity: Locator;
  readonly navCommand: Locator;
  readonly navAssistant: Locator;
  readonly navAbout: Locator;
  readonly userAvatarButton: Locator;
  readonly simulationToggle: Locator;

  constructor(page: any) {
    super(page);
    this.logoImg = page.locator('img[alt="ResiliAI logo"]');
    this.navOverview = page.getByRole("button", { name: "Overview" });
    this.navMap = page.getByRole("button", { name: "Risk map" });
    this.navAlerts = page.getByRole("button", { name: "Alerts" });
    this.navCommunity = page.getByRole("button", { name: "Community" });
    this.navCommand = page.getByRole("button", { name: "Command center" });
    this.navAssistant = page.getByRole("button", { name: "Assistant" });
    this.navAbout = page.getByRole("button", { name: "About" });
    this.userAvatarButton = page.locator('button[aria-label="User profile"], button:has(img[alt="ResiliAI logo"]), button:has-text("Demo Responder")').first();
    this.simulationToggle = page.getByRole("button", { name: /Simulation|Live mode/i });
  }

  async verifyBrandHeader() {
    await expect(this.logoImg).toBeVisible();
    await this.verifyImageLoaded('img[alt="ResiliAI logo"]');
  }

  async selectTab(tabName: "Overview" | "Risk map" | "Alerts" | "Community" | "Command center" | "Assistant" | "About") {
    const tabButton = this.page.getByRole("button", { name: tabName, exact: true });
    await expect(tabButton).toBeVisible();
    await tabButton.click();
    // Wait for transition animation
    await this.page.waitForTimeout(350);
  }

  async verifyTabContent(tabName: string, expectedHeading: RegExp | string) {
    await expect(this.page.getByText(expectedHeading).first()).toBeVisible();
  }
}
