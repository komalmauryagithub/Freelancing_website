import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function checkSite(name: string, url: string) {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    console.log(`Checking ${name}: ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll("a")).map((a) => ({
        text: a.textContent?.trim(),
        href: a.href,
      }));
      const textSnippets = Array.from(document.querySelectorAll("h1, h2, h3, button")).map((el) =>
        el.textContent?.trim()
      );
      return { links: allLinks, textSnippets };
    });
    console.log(`=== ${name} ===`);
    console.log("Current URL:", page.url());
    console.log("Headings / Buttons:", JSON.stringify(links.textSnippets.slice(0, 10), null, 2));
    console.log("Links:", JSON.stringify(links.links.slice(0, 10), null, 2));
  } catch (e: any) {
    console.error(`Error checking ${name}:`, e.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  await checkSite("SketchNest", "https://sketchnest.onrender.com");
  await checkSite("AI Chatbot", "https://ai-chatbot-m9sm.onrender.com");
  await checkSite("MEMORA", "https://modera-2dh0.onrender.com");
}

main();
