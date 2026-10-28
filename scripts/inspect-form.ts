import puppeteer from "puppeteer-core";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.goto("https://ai-expenses-and-business-analytics-1.onrender.com", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  const html = await page.evaluate(() => {
    return document.querySelector("form")?.outerHTML || document.body.innerHTML;
  });

  console.log("LOGIN FORM HTML:");
  console.log(html.slice(0, 1500));
  await browser.close();
}

main();
