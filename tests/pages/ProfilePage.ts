import { Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProfilePage extends BasePage {
  readonly profileTitle: Locator;
  readonly roleSelect: Locator;
  readonly regionSelect: Locator;
  readonly emergencyContactInput: Locator;
  readonly savePreferencesBtn: Locator;
  readonly smsCheckbox: Locator;
  readonly emailCheckbox: Locator;
  readonly pushCheckbox: Locator;
  readonly alertThresholdSelect: Locator;
  readonly languageSelect: Locator;
  readonly signOutBtn: Locator;
  readonly confirmSignOutBtn: Locator;

  constructor(page: any) {
    super(page);
    this.profileTitle = page.getByRole("heading", { name: "Your profile" });
    this.roleSelect = page.locator("label:has-text('Role / designation') select");
    this.regionSelect = page.locator("label:has-text('Preferred region') select");
    this.emergencyContactInput = page.getByPlaceholder("Name · phone number");
    this.savePreferencesBtn = page.getByRole("button", { name: /Save preferences|Saved/i });
    this.smsCheckbox = page.locator("label:has-text('SMS alerts') input[type='checkbox']");
    this.emailCheckbox = page.locator("label:has-text('Email alerts') input[type='checkbox']");
    this.pushCheckbox = page.locator("label:has-text('Push alerts') input[type='checkbox']");
    this.alertThresholdSelect = page.locator("label:has-text('Alert threshold') select");
    this.languageSelect = page.locator("label:has-text('Language') select");
    this.signOutBtn = page.getByRole("button", { name: "Sign out" });
    this.confirmSignOutBtn = page.getByRole("button", { name: "Confirm sign out" });
  }

  async verifyProfileSections() {
    await expect(this.profileTitle).toBeVisible();
    await expect(this.roleSelect).toBeVisible();
    await expect(this.regionSelect).toBeVisible();
    await expect(this.emergencyContactInput).toBeVisible();
    await expect(this.savePreferencesBtn).toBeVisible();
  }

  async updateRoleAndRegion(role: string, region: string) {
    await this.roleSelect.selectOption(role);
    await this.regionSelect.selectOption(region);
    await this.emergencyContactInput.fill("Disaster Ops (+91 98765 43210)");
    await this.savePreferencesBtn.click();
    await expect(this.page.getByText("Saved")).toBeVisible();

    // Verify persistence in localStorage
    const savedRole = await this.page.evaluate(() => localStorage.getItem("resiliai-role"));
    const savedRegion = await this.page.evaluate(() => localStorage.getItem("resiliai-region"));
    expect(savedRole).toBe(role);
    expect(savedRegion).toBe(region);
  }

  async toggleNotifications() {
    await expect(this.smsCheckbox).toBeChecked();
    await this.smsCheckbox.uncheck();
    await expect(this.smsCheckbox).not.toBeChecked();
    await this.smsCheckbox.check();
    await expect(this.smsCheckbox).toBeChecked();
  }

  async initiateSignOut() {
    await this.signOutBtn.click();
    await expect(this.confirmSignOutBtn).toBeVisible();
    await this.confirmSignOutBtn.click();
    // After sign-out, user is redirected back to login screen
    await expect(this.page.getByRole("heading", { name: /Build resilience before the crisis/i })).toBeVisible();
    const guestFlag = await this.page.evaluate(() => localStorage.getItem("resiliai-guest"));
    expect(guestFlag).toBeNull();
  }
}
