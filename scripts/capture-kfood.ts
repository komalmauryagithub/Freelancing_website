import puppeteer from "puppeteer-core";
import path from "path";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1280,860"],
    defaultViewport: { width: 1280, height: 860 },
  });

  try {
    const page = await browser.newPage();
    console.log("Navigating to KFood...");
    await page.goto("https://kfood-1-mfqv.onrender.com", {
      waitUntil: "networkidle2",
      timeout: 40000,
    });

    await page.waitForSelector("img", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Replace the "No Image" div with crispy fried chicken
    await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll("*"));
      const noImgEl = allElements.find(
        (el) => el.children.length === 0 && el.textContent?.trim() === "No Image"
      );
      if (noImgEl && noImgEl.parentElement) {
        noImgEl.parentElement.innerHTML = `
          <img 
            src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80" 
            style="width:100%; height:100%; object-fit:cover; display:block;" 
            alt="Korean fried chicken"
          />
        `;
      }
    });

    // Wait a brief moment for the image to paint
    await new Promise((r) => setTimeout(r, 2000));

    // Scroll to feature dishes cleanly with buttons
    await page.evaluate(() => {
      window.scrollTo({ top: 400, behavior: "instant" });
    });
    await new Promise((r) => setTimeout(r, 1000));

    const dest = path.join(process.cwd(), "public", "images", "projects", "kfood-store.png");
    await page.screenshot({ path: dest });
    console.log("✓ Saved perfected KFood screenshot to:", dest);
  } catch (err: any) {
    console.error("KFood error:", err.message);
  } finally {
    await browser.close();
  }
}

main();
