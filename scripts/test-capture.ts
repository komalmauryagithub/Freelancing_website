import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,800"],
    defaultViewport: { width: 1280, height: 800 },
  });

  const page = await browser.newPage();

  try {
    console.log("Navigating to AI Expenses...");
    await page.goto("https://ai-expenses-and-business-analytics-1.onrender.com", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 1. Click Demo Admin
    console.log("Clicking Demo Admin...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.includes("Demo Admin"));
      if (btn) (btn as HTMLButtonElement).click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    // 2. Click Sign In button
    console.log("Clicking Sign In button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.trim() === "Sign In");
      if (btn) (btn as HTMLButtonElement).click();
    });

    console.log("Waiting for dashboard to load...");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 5000)); // wait for charts, tables, cards to render

    console.log("Current page URL:", page.url());
    const dest = path.join(process.cwd(), "public", "images", "projects", "ai-analytics.png");
    await page.screenshot({ path: dest });
    console.log("✓ Successfully saved inner AI Analytics dashboard to:", dest);
  } catch (err) {
    console.error("AI Expenses capture error:", err);
  }

  await browser.close();
}

main();
