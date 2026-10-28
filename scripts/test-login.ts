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
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  try {
    console.log("1. Loading AI Expense...");
    await page.goto("https://ai-expenses-and-business-analytics-1.onrender.com", {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    console.log("Waiting for Demo Admin button...");
    await page.waitForSelector("button", { timeout: 15000 });

    // Click Demo Admin
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.includes("Demo Admin"));
      if (btn) btn.click();
    });
    console.log("Clicked Demo Admin!");

    await new Promise((r) => setTimeout(r, 1500));

    // Click Sign In
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.trim() === "Sign In");
      if (btn) btn.click();
    });
    console.log("Clicked Sign In button!");

    // Wait for URL change or dashboard elements
    await new Promise((r) => setTimeout(r, 6000));
    console.log("Current URL after login:", page.url());

    const dest = path.join(process.cwd(), "public", "images", "projects", "ai-analytics.png");
    await page.screenshot({ path: dest });
    console.log("Saved screenshot to:", dest);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

main();
