import { Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AuthPage extends BasePage {
  readonly loginHeadline: Locator;
  readonly googleLoginBtn: Locator;
  readonly guestLoginBtn: Locator;
  readonly monitoringBadge: Locator;
  readonly privacyLink: Locator;
  readonly emergencyLink: Locator;

  constructor(page: any) {
    super(page);
    this.loginHeadline = page.getByRole("heading", { name: /Build resilience before the crisis/i });
    this.googleLoginBtn = page.getByRole("button", { name: /Continue with Google/i });
    this.guestLoginBtn = page.getByRole("button", { name: /Explore Dashboard/i });
    this.monitoringBadge = page.getByText(/Live monitoring across Maharashtra/i);
    this.privacyLink = page.getByRole("link", { name: /Privacy Policy/i });
    this.emergencyLink = page.getByRole("link", { name: /Emergency Resources/i });
  }

  async clearSession() {
    await this.page.goto("/");
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload({ waitUntil: "domcontentloaded" });
  }

  async verifyLoginPageUI() {
    await expect(this.loginHeadline).toBeVisible();
    await expect(this.googleLoginBtn).toBeVisible();
    await expect(this.guestLoginBtn).toBeVisible();
    await expect(this.monitoringBadge).toBeVisible();
    await expect(this.privacyLink).toHaveAttribute("href", "#privacy");
    await expect(this.emergencyLink).toHaveAttribute("href", "#emergency");
  }

  async loginAsGuest() {
    await this.guestLoginBtn.click();
    // Verify guest token is stored in localStorage
    const guestFlag = await this.page.evaluate(() => localStorage.getItem("resiliai-guest"));
    expect(guestFlag).toBe("true");
  }

  async verifyRedirectToDashboard() {
    await expect(this.page.getByRole("button", { name: /Overview/i })).toBeVisible({ timeout: 10000 });
  }
}
