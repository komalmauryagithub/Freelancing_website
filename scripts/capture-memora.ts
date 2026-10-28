import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", (err: any) => console.log("PAGE ERROR:", err.message));

    console.log("Navigating to Memora root...");
    await page.goto("https://modera-2dh0.onrender.com", {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    // Click "Create an Account"
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a, span, button"));
      const found = links.find((l) => l.textContent?.includes("Create an Account"));
      if (found) {
        (found as HTMLElement).click();
      }
    });

    // Wait for the registration form input to appear
    await page.waitForSelector('input[placeholder="e.g. Komal Sharma"]', { timeout: 10000 });
    console.log("Register form appeared!");

    // Type into inputs
    const nameInput = await page.$('input[placeholder="e.g. Komal Sharma"]');
    const emailInput = await page.$('input[placeholder="you@example.com"]');
    const passInput = await page.$('input[placeholder="At least 6 characters"]');
    const confirmInput = await page.$('input[placeholder="Repeat password"]');

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const email = `komal_user_${randomId}@gmail.com`;
    console.log("Registering with:", email);

    if (nameInput) await nameInput.type("Komal Maurya", { delay: 30 });
    if (emailInput) await emailInput.type(email, { delay: 30 });
    if (passInput) await passInput.type("SecretPass123!", { delay: 30 });
    if (confirmInput) await confirmInput.type("SecretPass123!", { delay: 30 });

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      console.log("Clicking Create My Scrapbook button...");
      await submitBtn.click();
    }

    console.log("Waiting for dashboard/calendar to load...");
    // Wait until spinner disappears or up to 20 seconds
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const text = await page.evaluate(() => document.body.innerText);
      if (!text.includes("Opening MEMORA...") && text.length > 50) {
        console.log(`Loaded after ${i + 1}s! Body snippet:`, text.slice(0, 100).replace(/\n/g, " "));
        break;
      }
    }

    // Give 2 extra seconds for layout/animations
    await new Promise((r) => setTimeout(r, 2000));

    console.log("Current URL:", page.url());
    const dest = path.join(process.cwd(), "public", "images", "projects", "memora-calendar.png");
    await page.screenshot({ path: dest });
    console.log("✓ Saved MEMORA screenshot to:", dest);
  } catch (err: any) {
    console.error("Memora error:", err.message);
  } finally {
    await browser.close();
  }
}

main();
