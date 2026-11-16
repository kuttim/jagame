import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { testEmail } from "./cleanup";
import { addExpense, addMember, createGroup, register, view } from "./helpers";

// The main flow from the README: a new user creates a group, adds members and
// expenses, sees who owes whom, and settles up. The numbers are the example
// from the landing page, so that page never promises something untrue.

test("a new user creates a group, adds expenses and settles up", async ({ page }) => {
  await register(page, "Mari", testEmail("flow"));
  const group = "Lissaboni reis";
  await createGroup(page, group);
  await addMember(page, "Karl");
  await addMember(page, "Liis");

  await addExpense(page, group, { description: "Majutus", amount: "120", payer: "Mari" });
  await addExpense(page, group, { description: "Õhtusöök", amount: "45", payer: "Karl" });
  await addExpense(page, group, { description: "Taksod", amount: "15", payer: "Liis" });

  // Balances: 180 € shared by three is 60 € each
  const rowOf = (text: string) => view(page).getByRole("listitem").filter({ hasText: text });
  await expect(rowOf("maksis 120,00 €")).toContainText("+60,00 €");
  await expect(rowOf("maksis 45,00 €")).toContainText("−15,00 €");
  await expect(rowOf("maksis 15,00 €")).toContainText("−45,00 €");
  await expect(view(page)).toContainText("Kokku 180,00 €");

  // The suggested transfers are the landing page's promise
  await expect(rowOf("Liis → Mari")).toContainText("45,00 €");
  await expect(rowOf("Karl → Mari")).toContainText("15,00 €");

  // Paying them one by one leaves everyone even
  await rowOf("Liis → Mari").getByRole("button", { name: /Märgi tasutuks/ }).click();
  await expect(view(page).getByRole("heading", { name: "Tehtud ülekanded" })).toBeVisible();
  await expect(rowOf("maksis 15,00 €")).toContainText("0,00 €");
  await expect(rowOf("maksis 120,00 €")).toContainText("+15,00 €");

  await rowOf("Karl → Mari").getByRole("button", { name: /Märgi tasutuks/ }).click();
  await expect(view(page)).toContainText("Kõik on tasa");
  await expect(view(page).getByRole("button", { name: /Märgi tasutuks/ })).toHaveCount(0);
  await expect(view(page)).toContainText("Kokku 180,00 €");

  // A mistake can be taken back
  await view(page).getByRole("button", { name: /Võta tasumine tagasi: Karl/ }).click();
  await expect(rowOf("Karl → Mari")).toContainText("15,00 €");

  // The expenses can be downloaded as CSV for a spreadsheet
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    view(page).getByRole("link", { name: "kulud", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("jagame-lissaboni-reis-kulud.csv");
  const csv = await readFile((await download.path())!, "utf-8");
  expect(csv.startsWith("﻿")).toBe(true);
  expect(csv).toContain("Majutus;120,00;Mari;Võrdselt;40,00;40,00;40,00");
});

test("the expense form explains mistakes and supports all three splits", async ({ page }) => {
  await register(page, "Mari", testEmail("splits"));
  const group = "Kuluvorm";
  await createGroup(page, group);
  await addMember(page, "Karl");
  await addMember(page, "Liis");
  const everyone = ["Mari", "Karl", "Liis"];

  // Mistakes are explained, and what was typed stays
  await page.getByRole("link", { name: "Lisa kulu" }).click();
  await page.getByRole("button", { name: "Lisa kulu" }).click();
  await expect(page.getByText("Sisesta, mille eest maksti.")).toBeVisible();
  await expect(page.getByText("Sisesta summa numbrina, nt 12,50.")).toBeVisible();
  await page.getByLabel("Mille eest?").fill("Takso");
  await page.getByLabel("Summa (€)", { exact: true }).fill("20");
  await view(page).getByText("Summadena", { exact: true }).click();
  await page.getByLabel("Summa (€): Mari").fill("5");
  await page.getByLabel("Summa (€): Karl").fill("14");
  await page.getByLabel("Summa (€): Liis").fill("0");
  await page.getByRole("button", { name: "Lisa kulu" }).click();
  await expect(page.getByText("Summad annavad kokku 19,00 €, aga kulu on 20,00 €.")).toBeVisible();
  await expect(page.getByLabel("Summa (€): Karl")).toHaveValue("14");
  await expect(view(page).getByText("Summadena", { exact: true })).toBeVisible();

  // Fix it and save: the amounts split really is by amounts
  await page.getByLabel("Summa (€): Karl").fill("15");
  await page.getByRole("button", { name: "Lisa kulu" }).click();
  await expect(page.getByRole("heading", { level: 1, name: group })).toBeVisible();
  await expect(view(page)).toContainText("Mari 5,00 €, Karl 15,00 €, Liis 0,00 €");

  // Percentages that must be rounded by cents: 1,00 € by 33,34 / 33,33 / 33,33 %
  await addExpense(page, group, {
    description: "Kohv",
    amount: "1,00",
    payer: "Liis",
    split: { type: "Protsentidena", values: { Mari: "33,34", Karl: "33,33", Liis: "33,33" } },
  });
  await expect(view(page)).toContainText("Mari 0,34 €, Karl 0,33 €, Liis 0,33 €");

  // Only some people take part
  await addExpense(page, group, {
    description: "Jäätis",
    amount: "6",
    payer: "Mari",
    only: ["Mari", "Liis"],
    everyone,
  });
  await expect(view(page)).toContainText("Mari 3,00 €, Liis 3,00 €");

  // Editing and deleting
  await view(page).getByRole("listitem").filter({ hasText: "Jäätis" }).getByRole("link", { name: "Muuda" }).click();
  await expect(page.getByLabel("Summa (€)", { exact: true })).toHaveValue("6,00");
  await page.getByLabel("Summa (€)", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Salvesta" }).click();
  await expect(view(page)).toContainText("Mari 4,00 €, Liis 4,00 €");

  page.once("dialog", (dialog) => dialog.accept());
  await view(page).getByRole("listitem").filter({ hasText: "Jäätis" }).getByRole("link", { name: "Muuda" }).click();
  await page.getByRole("button", { name: "Kustuta kulu" }).click();
  await expect(page.getByRole("heading", { level: 1, name: group })).toBeVisible();
  await expect(view(page)).not.toContainText("Jäätis");

  // A member who has expenses cannot be removed
  await page.getByRole("button", { name: "Eemalda Karl" }).click();
  await expect(page.getByText("Liiget ei saa eemaldada, sest tal on kulusid või tasumisi.")).toBeVisible();
});
