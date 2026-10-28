import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,1200"],
    defaultViewport: { width: 1280, height: 1200 },
  });

  try {
    const page = await browser.newPage();
    console.log("Opening http://localhost:3000/projects...");
    await page.goto("http://localhost:3000/projects", {
      waitUntil: "networkidle2",
      timeout: 25000,
    });

    // Check all image sources and titles
    const cards = await page.evaluate(() => {
      const cardEls = Array.from(document.querySelectorAll("article, [class*='Card'], .group"));
      return cardEls.map((c) => {
        const title = c.querySelector("h3")?.textContent?.trim();
        const img = c.querySelector("img");
        return {
          title,
          imgSrc: img?.src,
        };
      }).filter(c => c.title);
    });

    console.log("Projects found on page:", JSON.stringify(cards, null, 2));

    const snapPath = path.join(process.cwd(), "public", "images", "verified-projects-page.png");
    await page.screenshot({ path: snapPath, fullPage: false });
    console.log("✓ Saved live screenshot of /projects to:", snapPath);

    // Also check homepage
    console.log("Opening http://localhost:3000/...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle2" });
    const homeSnap = path.join(process.cwd(), "public", "images", "verified-home-featured.png");
    await page.screenshot({ path: homeSnap, fullPage: false });
    console.log("✓ Saved live screenshot of home to:", homeSnap);
  } catch (err: any) {
    console.error("Verification error:", err.message);
  } finally {
    await browser.close();
  }
}

main();
