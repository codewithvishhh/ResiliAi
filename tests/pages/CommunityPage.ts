import { Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CommunityPage extends BasePage {
  readonly reportIncidentBtn: Locator;
  readonly modalTitle: Locator;
  readonly areaInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitReportBtn: Locator;
  readonly successCheckmark: Locator;
  readonly closeSuccessBtn: Locator;

  constructor(page: any) {
    super(page);
    this.reportIncidentBtn = page.getByRole("button", { name: /Report incident/i });
    this.modalTitle = page.getByRole("heading", { name: /Report an incident/i });
    this.areaInput = page.getByPlaceholder("e.g. Wakad Chowk or Baner Road");
    this.descriptionInput = page.getByPlaceholder("Describe what you're seeing…");
    this.submitReportBtn = page.getByRole("button", { name: "Submit report" });
    this.successCheckmark = page.getByText("Report received");
    this.closeSuccessBtn = page.getByRole("button", { name: "Close" });
  }

  async openIncidentModal() {
    await this.reportIncidentBtn.click();
    await expect(this.modalTitle).toBeVisible();
  }

  async selectIncidentType(typeName: string) {
    const typeBtn = this.page.getByRole("button", { name: typeName, exact: true });
    await expect(typeBtn).toBeVisible();
    await typeBtn.click();
  }

  async submitIncident(type: string, area: string, description: string) {
    await this.selectIncidentType(type);
    await this.areaInput.fill(area);
    await this.descriptionInput.fill(description);
    await this.submitReportBtn.click();

    // Verify submission confirmation state
    await expect(this.successCheckmark).toBeVisible();
    await this.closeSuccessBtn.click();
    await expect(this.modalTitle).not.toBeVisible();
  }

  async verifyReportInFeed(area: string) {
    await expect(this.page.getByText(new RegExp(area, "i")).first()).toBeVisible();
  }
}
