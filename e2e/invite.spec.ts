import { expect, test } from "@playwright/test";
import { testEmail } from "./cleanup";
import { addMember, createGroup, register, view } from "./helpers";

// Joining needs only the link; what each person may do depends on who they are.

test("someone with the link joins without an account and gets only a member's rights", async ({
  page,
  browser,
}) => {
  await register(page, "Omanik", testEmail("invite"));
  const link = await createGroup(page, "Rootsi reis");
  await addMember(page, "Mari");

  // The owner sees the group straight away
  await expect(view(page).getByText("Sind on kutsutud")).toHaveCount(0);
  await expect(page.getByLabel("Lisa liige nime järgi")).toBeVisible();

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(link);

  // A visitor is invited and sees nothing of the group yet
  await expect(guestPage.getByRole("heading", { level: 1 })).toHaveText("Sind on kutsutud gruppi „Rootsi reis”");
  await expect(guestPage.getByLabel("Lisa liige nime järgi")).toHaveCount(0);
  await expect(guestPage.getByRole("button", { name: /Eemalda/ })).toHaveCount(0);

  // Asked for a name, and a taken name is refused (case does not matter)
  await guestPage.getByRole("button", { name: "Liitu grupiga" }).click();
  await expect(guestPage.getByText("Sisesta liikme nimi.")).toBeVisible();
  await guestPage.getByLabel("Sinu nimi").fill("mari");
  await guestPage.getByRole("button", { name: "Liitu grupiga" }).click();
  await expect(guestPage.getByText("Selline liige on grupis juba olemas.")).toBeVisible();

  await guestPage.getByLabel("Sinu nimi").fill("Liis");
  await guestPage.getByRole("button", { name: "Liitu grupiga" }).click();
  await expect(guestPage.getByRole("heading", { level: 1, name: "Rootsi reis" })).toBeVisible();
  await expect(view(guestPage).getByRole("listitem").filter({ hasText: "Liis" })).toContainText("(sina)");

  // A member cannot add or remove others, but can leave
  await expect(guestPage.getByLabel("Lisa liige nime järgi")).toHaveCount(0);
  await expect(guestPage.getByRole("button", { name: /Eemalda Mari/ })).toHaveCount(0);

  // The membership survives a reload
  await guestPage.reload();
  await expect(guestPage.getByRole("heading", { level: 1, name: "Rootsi reis" })).toBeVisible();

  // The cookie cannot be forged: the same cookie with a wrong signature is not accepted
  const cookie = (await guest.cookies()).find((c) => c.name.startsWith("member-"))!;
  expect(cookie.httpOnly).toBe(true);
  const forger = await browser.newContext();
  await forger.addCookies([
    { name: cookie.name, value: `${cookie.value.split(".")[0]}.forged`, url: link },
  ]);
  const forgerPage = await forger.newPage();
  await forgerPage.goto(link);
  await expect(forgerPage.getByRole("heading", { level: 1 })).toContainText("Sind on kutsutud");

  // Leaving puts the member back in front of the invitation
  await guestPage.getByRole("button", { name: "Lahku grupist" }).click();
  await expect(guestPage.getByRole("heading", { level: 1 })).toContainText("Sind on kutsutud");

  await guest.close();
  await forger.close();
});

test("a person without access cannot read a group or its data", async ({ page, browser }) => {
  await register(page, "Omanik", testEmail("access"));
  const link = await createGroup(page, "Salajane grupp");
  const token = link.split("/g/")[1];

  const stranger = await browser.newContext();
  const strangerPage = await stranger.newPage();

  // Not signed in: "Minu grupid" needs a login
  await strangerPage.goto("/groups");
  await expect(strangerPage).toHaveURL(/\/login/);

  // Has the link but has not joined: the CSV is closed, and so is adding an expense
  const csv = await stranger.request.get(`/g/${token}/export`);
  expect(csv.status()).toBe(403);
  expect(await csv.text()).not.toContain("Salajane");
  await strangerPage.goto(`${link}/expenses/new`);
  await expect(strangerPage.getByRole("heading", { level: 1 })).toContainText("Sind on kutsutud");

  // Not a real link
  const missing = await stranger.request.get("/g/see-linki-pole/export");
  expect(missing.status()).toBe(404);
  await strangerPage.goto("/g/see-linki-pole");
  await expect(strangerPage.getByRole("heading", { level: 1, name: "Seda lehte ei leitud" })).toBeVisible();

  // The group's page tells search engines to stay away and does not leak the link
  const html = await (await stranger.request.get(link)).text();
  expect(html).toContain("noindex");
  expect(html).toContain("no-referrer");

  // Basic security headers are on every page
  const home = await stranger.request.get("/");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(home.headers()["x-powered-by"]).toBeUndefined();

  await stranger.close();
});
