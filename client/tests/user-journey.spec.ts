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
  FIRST_NAME_INPUT: 'input[name="firstName"], input[placeholder*="first"]',
  LAST_NAME_INPUT: 'input[name="lastName"], input[placeholder*="last"]',
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

  // Dropdown menus
  VIEW_DETAILS_ITEM: '[role="menuitem"]:has-text("View Details")',
  DELETE_ITEM: '[role="menuitem"]:has-text("Delete")',
  BULK_RERUN_BUTTON: 'button:has-text("Re-run")',
  BULK_DELETE_BUTTON: 'button:has-text("Delete")',
  CONFIRM_DELETE_BUTTON: 'button:has-text("Delete"):not([aria-haspopup])',

  // Navigation
  BACK_BUTTON:
    'button:has-text("Back"), a:has-text("Dashboard"), [aria-label*="back"], .breadcrumb a',
  USER_DROPDOWN:
    "header button:has(canvas), header [data-radix-collection-item]",
  SIGN_OUT_ITEM: '[role="menuitem"]:has-text("Sign out")',
} as const;

// URL patterns
const URL_PATTERNS = {
  LOGIN: /.*\/login/,
  DASHBOARD: /.*\/dashboard/,
  CRAWL_DETAILS: /.*\/dashboard\/crawl\/\d+/,
  LOGGED_OUT: /\/(login|register|$)/,
} as const;

// Test data interface
interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Helper class for page object pattern
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

  async openFirstCrawlActions() {
    await this.page.locator(SELECTORS.FIRST_ROW_ACTIONS).click();
  }

  async selectAllCrawls() {
    await this.page.locator(SELECTORS.SELECT_ALL_CHECKBOX).click();
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
  }

  async performBulkAction(actionButton: string) {
    await this.page.click(actionButton);
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
  }

  async confirmDeletion() {
    await this.page.click(SELECTORS.CONFIRM_DELETE_BUTTON);
  }
}

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

  async logout() {
    await this.page.locator(SELECTORS.USER_DROPDOWN).first().click();
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
    await this.page.click(SELECTORS.SIGN_OUT_ITEM);
    await expect(this.page).toHaveURL(URL_PATTERNS.LOGGED_OUT);
  }
}

test.describe("Complete User Journey - Happy Path (9 Scenarios)", () => {
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
  });

  test("Complete end-to-end user journey: sign up → login → create 10 crawls → check details → back to dashboard → delete crawl → bulk re-analyze → bulk delete → logout", async ({
    page,
  }) => {
    const CRAWL_COUNT = 10;

    // Step 1: Sign Up
    await test.step("1. User sign up", async () => {
      await authPage.signUp(testUser);
    });

    // Step 2: Login
    await test.step("2. User login", async () => {
      await authPage.login(testUser);
      await dashboardPage.waitForLoading();
    });

    // Step 3: Create multiple crawls
    await test.step("3. Create 10 crawls", async () => {
      const testUrls = Array.from({ length: CRAWL_COUNT }, () =>
        faker.internet.url()
      );

      await dashboardPage.openCrawlSheet();

      // Add all URLs
      for (const url of testUrls) {
        await dashboardPage.addUrl(url);
      }

      await dashboardPage.closeSheetIfNeeded();
      await page.waitForTimeout(TIMEOUTS.UI_INTERACTION); // Wait for crawls to be initiated
    });

    // Step 4: Check a crawl details page
    await test.step("4. Check crawl details page", async () => {
      await dashboardPage.waitForCrawlsToAppear();
      await dashboardPage.waitForLoading();

      await dashboardPage.openFirstCrawlActions();
      await page.click(SELECTORS.VIEW_DETAILS_ITEM);

      await expect(page).toHaveURL(URL_PATTERNS.CRAWL_DETAILS, {
        timeout: TIMEOUTS.NAVIGATION,
      });
      await dashboardPage.waitForLoading();
    });

    // Step 5: Go back to dashboard
    await test.step("5. Go back to dashboard", async () => {
      const backButton = page.locator(SELECTORS.BACK_BUTTON).first();

      if (await backButton.isVisible()) {
        await backButton.click();
      } else {
        await page.goto("/dashboard");
      }

      await expect(page).toHaveURL(URL_PATTERNS.DASHBOARD);
      await page.waitForTimeout(TIMEOUTS.LOADING);
    });

    // Step 6: Delete a single crawl
    await test.step("6. Delete a crawl", async () => {
      await dashboardPage.openFirstCrawlActions();
      await page.click(SELECTORS.DELETE_ITEM);

      await page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
      await dashboardPage.confirmDeletion();
      await dashboardPage.waitForLoading();
    });

    // Step 7: Bulk re-analyze remaining crawls
    await test.step("7. Bulk re-analyze rest of crawls", async () => {
      await dashboardPage.selectAllCrawls();
      await dashboardPage.performBulkAction(SELECTORS.BULK_RERUN_BUTTON);
      await page.waitForTimeout(TIMEOUTS.LOADING);
    });

    // Step 8: Bulk delete all crawls
    await test.step("8. Bulk delete all crawls", async () => {
      await dashboardPage.selectAllCrawls();
      await dashboardPage.performBulkAction(SELECTORS.BULK_DELETE_BUTTON);
      await dashboardPage.confirmDeletion();
      await page.waitForTimeout(TIMEOUTS.BULK_OPERATION);
    });

    // Step 9: Logout
    await test.step("9. User logout", async () => {
      await authPage.logout();
    });
  });
});
