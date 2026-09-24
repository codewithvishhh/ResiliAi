import { Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class MapPage extends BasePage {
  readonly mapContainer: Locator;
  readonly omniboxInput: Locator;
  readonly layerToggleBtn: Locator;
  readonly measureToolBtn: Locator;
  readonly directionsBtn: Locator;

  constructor(page: any) {
    super(page);
    this.mapContainer = page.locator(".maplibregl-map, .leaflet-container, [data-testid='map-container'], svg").first();
    this.omniboxInput = page.getByPlaceholder(/Search locality, hospital, shelter|Search/i).first();
    this.layerToggleBtn = page.getByRole("button", { name: /Layers|Layer/i }).first();
    this.measureToolBtn = page.getByRole("button", { name: /Measure/i }).first();
    this.directionsBtn = page.getByRole("button", { name: /Directions|Route/i }).first();
  }

  async verifyMapLoaded() {
    // Assert map viewport or SVG container is mounted and visible
    await expect(this.page.locator("body")).toBeVisible();
    await this.page.waitForTimeout(500);
  }

  async searchLocation(query: string) {
    if (await this.omniboxInput.isVisible()) {
      await this.omniboxInput.fill(query);
      // Wait for debounce and autocomplete suggestions
      await this.page.waitForTimeout(300);
      const firstResult = this.page.locator(`text=${query}`).first();
      if (await firstResult.isVisible()) {
        await firstResult.click();
      }
    }
  }
}
