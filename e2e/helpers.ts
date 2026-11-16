import { expect, type Page } from "@playwright/test";

// Small helpers that do what a person does on the site. They use labels and
// roles (what a user sees), not CSS classes, so they survive restyling.

export const PASSWORD = "correct horse battery";

/** The visible page content. The router keeps earlier pages in the DOM, hidden. */
export const view = (page: Page) => page.locator("main:visible");

export async function register(page: Page, name: string, email: string) {
  await page.goto("/register");
  await page.getByLabel("Nimi").fill(name);
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Parool").fill(PASSWORD);
  await page.getByRole("button", { name: "Registreeru" }).click();
  await page.waitForURL("**/groups");
  await expect(page.getByRole("heading", { name: "Minu grupid" })).toBeVisible();
}

/** Creates a group from "Minu grupid" and returns the link that others can use. */
export async function createGroup(page: Page, name: string): Promise<string> {
  await page.getByLabel("Grupi nimi").fill(name);
  await page.getByRole("button", { name: "Loo grupp" }).click();
  await page.waitForURL(/\/g\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  return page.url();
}

/** The owner adds someone by name. */
export async function addMember(page: Page, name: string) {
  await page.getByLabel("Lisa liige nime järgi").fill(name);
  await page.getByRole("button", { name: "Lisa", exact: true }).click();
  await expect(view(page).getByRole("listitem").filter({ hasText: name }).first()).toBeVisible();
}

export type ExpenseOptions = {
  description: string;
  /** As typed, for example "12,50" */
  amount: string;
  payer: string;
  /** Names of those who take part; everyone if left out */
  only?: string[];
  /** Everyone's names, needed when `only` is used */
  everyone?: string[];
  split?: { type: "Summadena" | "Protsentidena"; values: Record<string, string> };
};

export async function addExpense(page: Page, groupName: string, options: ExpenseOptions) {
  await page.getByRole("link", { name: "Lisa kulu" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Lisa kulu" })).toBeVisible();

  await page.getByLabel("Mille eest?").fill(options.description);
  await page.getByLabel("Summa (€)", { exact: true }).fill(options.amount);
  await page.getByLabel("Kes maksis?").selectOption({ label: options.payer });

  if (options.split) {
    await view(page).getByText(options.split.type, { exact: true }).click();
  }
  if (options.only && options.everyone) {
    for (const name of options.everyone) {
      await page.getByRole("checkbox", { name, exact: true }).setChecked(options.only.includes(name));
    }
  }
  if (options.split) {
    const label = options.split.type === "Summadena" ? "Summa (€)" : "Osa (%)";
    for (const [name, value] of Object.entries(options.split.values)) {
      await page.getByLabel(`${label}: ${name}`).fill(value);
    }
  }

  await page.getByRole("button", { name: "Lisa kulu" }).click();
  await expect(page.getByRole("heading", { level: 1, name: groupName })).toBeVisible();
}
