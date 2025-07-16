import { faker } from "@faker-js/faker";
import { expect, test, type Page } from "@playwright/test";

// Constants for configuration
const TIMEOUTS = {
  NAVIGATION: 50000,
  UI_INTERACTION: 5000,
  LOADING: 2000,
  SHORT_WAIT: 500,
  BULK_OPERATION: 3000,
} as const;

const SELECTORS = {
  // Forms
  FIRST_NAME_INPUT: 'input[name="firstName"]',
  LAST_NAME_INPUT: 'input[name="lastName"]',
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',

  // Dashboard
  CRAWL_BUTTON: 'button:has-text("Crawl URL(s)")',
  SHEET_DIALOG: '[role="dialog"], .sheet',
  URL_INPUT: 'input[placeholder="example.com"]',
  ADD_BUTTON: 'button:has-text("Add")',

  // Table
  TABLE_ROWS: "table tbody tr",
  FIRST_ROW_ACTIONS: "table tbody tr:first-child td:last-child",
  SELECT_ALL_CHECKBOX: 'th [role="checkbox"]:first-child',
  ROW_CHECKBOX: 'tbody tr [role="checkbox"]',

  // Dropdown menus
  VIEW_DETAILS_ITEM: '[role="menuitem"]:has-text("View Details")',
  DELETE_ITEM: '[role="menuitem"]:has-text("Delete")',
  BULK_RERUN_BUTTON: 'button:has-text("Re-run")',
  BULK_DELETE_BUTTON: 'button:has-text("Delete")',
  CONFIRM_DELETE_BUTTON: 'button:has-text("Delete"):not([aria-haspopup])',

  // Navigation
  BACK_BUTTON:
    'button:has-text("Back"), a:has-text("Dashboard"), [aria-label*="back"]',
} as const;

// URL patterns
const URL_PATTERNS = {
  LOGIN: /.*\/login/,
  DASHBOARD: /.*\/dashboard/,
  CRAWL_DETAILS: /.*\/dashboard\/crawl\/\d+/,
} as const;

// Test data interface
interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Auth page object
class AuthPage {
  constructor(private page: Page) {}

  async signUp(user: TestUser) {
    await this.page.goto("/register");
    await this.page.fill(SELECTORS.FIRST_NAME_INPUT, user.firstName);
    await this.page.fill(SELECTORS.LAST_NAME_INPUT, user.lastName);
    await this.page.fill(SELECTORS.EMAIL_INPUT, user.email);
    await this.page.fill(SELECTORS.PASSWORD_INPUT, user.password);
    await this.page.click(SELECTORS.SUBMIT_BUTTON);
    await this.page.waitForURL(URL_PATTERNS.LOGIN, {
      timeout: TIMEOUTS.NAVIGATION,
    });
  }

  async login(user: TestUser) {
    await this.page.fill(SELECTORS.EMAIL_INPUT, user.email);
    await this.page.fill(SELECTORS.PASSWORD_INPUT, user.password);
    await this.page.click(SELECTORS.SUBMIT_BUTTON);
    await expect(this.page).toHaveURL(URL_PATTERNS.DASHBOARD);
  }
}

// Dashboard page object
class DashboardPage {
  constructor(private page: Page) {}

  async waitForLoading() {
    await this.page.waitForTimeout(TIMEOUTS.LOADING);
  }

  async openCrawlSheet() {
    await this.page.click(SELECTORS.CRAWL_BUTTON);
    await expect(this.page.locator(SELECTORS.SHEET_DIALOG)).toBeVisible({
      timeout: TIMEOUTS.UI_INTERACTION,
    });
  }

  async addUrl(url: string) {
    const cleanUrl = url.replace(/^https?:\/\//, "");
    await this.page.fill(SELECTORS.URL_INPUT, cleanUrl);
    await this.page.click(SELECTORS.ADD_BUTTON);
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
  }

  async closeSheetIfNeeded() {
    const submitButton = this.page
      .locator(
        'button[type="submit"], button:has-text("Start Crawling"), button:has-text("Crawl All")'
      )
      .first();

    if (await submitButton.isVisible()) {
      await submitButton.click();
    } else {
      await this.page.keyboard.press("Escape");
    }
  }

  async waitForCrawlsToAppear() {
    await expect(this.page.locator(SELECTORS.TABLE_ROWS)).not.toHaveCount(0, {
      timeout: TIMEOUTS.NAVIGATION,
    });
  }

  async clickFirstCrawlRow() {
    await this.page.locator(SELECTORS.TABLE_ROWS).first().click();
  }

  async openFirstCrawlActions() {
    await this.page.locator(SELECTORS.FIRST_ROW_ACTIONS).click();
  }

  async selectAllCrawls() {
    await this.page.locator(SELECTORS.SELECT_ALL_CHECKBOX).click();
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
  }

  async selectFirstCrawl() {
    await this.page.locator(SELECTORS.ROW_CHECKBOX).first().click();
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
  }

  async performBulkAction(actionButton: string) {
    await this.page.click(actionButton);
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
  }

  async confirmDeletion() {
    await this.page.click(SELECTORS.CONFIRM_DELETE_BUTTON);
  }

  async navigateBack() {
    const backButton = this.page.locator(SELECTORS.BACK_BUTTON).first();
    if (await backButton.isVisible()) {
      await backButton.click();
    } else {
      await this.page.goto("/dashboard");
    }
    await expect(this.page).toHaveURL(URL_PATTERNS.DASHBOARD);
  }

  async getCrawlCount() {
    const crawlRows = this.page.locator(
      'table tbody tr:not(:has-text("No results"))'
    );
    return await crawlRows.count();
  }
}

test.describe("Crawl Control - Happy Path", () => {
  let testUser: TestUser;
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    // Generate fresh test data for each test
    testUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: "TestPassword123!",
    };

    // Initialize page objects
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);

    // Setup: Register and login user before each test
    await authPage.signUp(testUser);
    await authPage.login(testUser);
  });

  test("User can add a single crawl URL", async ({ page }) => {
    const testUrl = faker.internet.url();

    await dashboardPage.openCrawlSheet();
    await dashboardPage.addUrl(testUrl);
    await dashboardPage.closeSheetIfNeeded();

    await dashboardPage.waitForLoading();
    await dashboardPage.waitForCrawlsToAppear();
  });

  test("User can add multiple crawl URLs", async ({ page }) => {
    const testUrls = Array.from({ length: 3 }, () => faker.internet.url());

    await dashboardPage.openCrawlSheet();

    // Add multiple URLs
    for (const url of testUrls) {
      await dashboardPage.addUrl(url);
    }

    await dashboardPage.closeSheetIfNeeded();
    await page.waitForTimeout(TIMEOUTS.BULK_OPERATION);

    // Verify multiple crawls appear
    const crawlCount = await dashboardPage.getCrawlCount();
    expect(crawlCount).toBeGreaterThanOrEqual(testUrls.length);
  });

  test("User can view crawl details and navigate back", async ({ page }) => {
    // First add a crawl
    const testUrl = faker.internet.url();
    await dashboardPage.openCrawlSheet();
    await dashboardPage.addUrl(testUrl);
    await dashboardPage.closeSheetIfNeeded();

    // Wait for crawl to appear and click on it
    await dashboardPage.waitForCrawlsToAppear();
    await dashboardPage.waitForLoading();

    await dashboardPage.openFirstCrawlActions();
    await page.click(SELECTORS.VIEW_DETAILS_ITEM);

    // Should navigate to details page
    await expect(page).toHaveURL(URL_PATTERNS.CRAWL_DETAILS, {
      timeout: TIMEOUTS.NAVIGATION,
    });

    // Go back to dashboard
    await dashboardPage.navigateBack();
  });

  test("User can delete crawls", async ({ page }) => {
    // Add a crawl first
    const testUrl = faker.internet.url();
    await dashboardPage.openCrawlSheet();
    await dashboardPage.addUrl(testUrl);
    await dashboardPage.closeSheetIfNeeded();

    await dashboardPage.waitForCrawlsToAppear();
    await dashboardPage.waitForLoading();

    // Select and delete the crawl
    await dashboardPage.selectFirstCrawl();
    await dashboardPage.performBulkAction(SELECTORS.BULK_DELETE_BUTTON);
    await dashboardPage.confirmDeletion();

    await page.waitForTimeout(TIMEOUTS.LOADING);
  });

  test("User can perform bulk operations on crawls", async ({ page }) => {
    // Add multiple crawls
    const testUrls = Array.from({ length: 3 }, () => faker.internet.url());

    await dashboardPage.openCrawlSheet();

    for (const url of testUrls) {
      await dashboardPage.addUrl(url);
    }

    await dashboardPage.closeSheetIfNeeded();
    await page.waitForTimeout(TIMEOUTS.BULK_OPERATION);

    // Select all crawls
    await dashboardPage.selectAllCrawls();

    // Test re-analyze functionality
    await dashboardPage.performBulkAction(SELECTORS.BULK_RERUN_BUTTON);
    await page.waitForTimeout(TIMEOUTS.LOADING);

    // Test bulk delete
    await dashboardPage.selectAllCrawls();
    await dashboardPage.performBulkAction(SELECTORS.BULK_DELETE_BUTTON);
    await dashboardPage.confirmDeletion();

    await page.waitForTimeout(TIMEOUTS.LOADING);
  });
});
