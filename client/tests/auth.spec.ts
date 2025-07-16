import { faker } from "@faker-js/faker";
import { expect, test, type Page } from "@playwright/test";

// Constants for configuration
const TIMEOUTS = {
  NAVIGATION: 50000,
  SHORT_WAIT: 500,
} as const;

const SELECTORS = {
  // Forms
  FIRST_NAME_INPUT: 'input[name="firstName"], input[placeholder*="first"]',
  LAST_NAME_INPUT: 'input[name="lastName"], input[placeholder*="last"]',
  EMAIL_INPUT: 'input[type="email"]',
  PASSWORD_INPUT: 'input[type="password"]',
  SUBMIT_BUTTON: 'button[type="submit"]',

  // User dropdown
  USER_DROPDOWN:
    "header button:has(canvas), header [data-radix-collection-item]",
  SIGN_OUT_ITEM: '[role="menuitem"]:has-text("Sign out")',
} as const;

// URL patterns
const URL_PATTERNS = {
  LOGIN: /.*\/login/,
  DASHBOARD: /.*\/dashboard/,
  LOGGED_OUT: /\/(login|register|$)/,
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

  async logout() {
    await this.page.locator(SELECTORS.USER_DROPDOWN).first().click();
    await this.page.waitForTimeout(TIMEOUTS.SHORT_WAIT);
    await this.page.click(SELECTORS.SIGN_OUT_ITEM);
    await expect(this.page).toHaveURL(URL_PATTERNS.LOGGED_OUT);
  }
}

test.describe("Authentication Flow - Happy Path", () => {
  let testUser: TestUser;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    // Generate fresh test data for each test
    testUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: "TestPassword123!",
    };

    // Initialize page object
    authPage = new AuthPage(page);
  });

  test("User can register successfully", async ({ page }) => {
    await authPage.signUp(testUser);
  });

  test("User can login and logout successfully", async ({ page }) => {
    // First register the user
    await authPage.signUp(testUser);

    // Login with the same credentials
    await authPage.login(testUser);

    // Now logout
    await authPage.logout();
  });
});
