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
    await page.goto("https://ai-chatbot-m9sm.onrender.com/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Reveal appContainer and inject realistic conversation
    await page.evaluate(() => {
      const auth = document.getElementById("auth-container");
      const app = document.getElementById("app-container");
      const empty = document.getElementById("empty-state");
      const messages = document.getElementById("messages-container");
      const sessions = document.getElementById("sessions-container");
      const title = document.getElementById("current-chat-title");

      if (auth) auth.style.display = "none";
      if (app) app.style.display = "flex";
      if (empty) empty.style.display = "none";
      if (title) title.textContent = "React Architecture & Performance";

      if (sessions) {
        sessions.innerHTML = `
          <div class="session-item active" style="padding:10px 14px; margin-bottom:6px; border-radius:8px; background:rgba(255,255,255,0.08); display:flex; align-items:center; gap:10px; cursor:pointer;">
            <i class="fa-regular fa-message" style="color:#a855f7;"></i>
            <span style="font-size:13px; font-weight:500; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">React Architecture & Perf...</span>
          </div>
          <div class="session-item" style="padding:10px 14px; margin-bottom:6px; border-radius:8px; display:flex; align-items:center; gap:10px; cursor:pointer; color:#94a3b8;">
            <i class="fa-regular fa-message"></i>
            <span style="font-size:13px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">FastAPI Endpoints Setup</span>
          </div>
          <div class="session-item" style="padding:10px 14px; margin-bottom:6px; border-radius:8px; display:flex; align-items:center; gap:10px; cursor:pointer; color:#94a3b8;">
            <i class="fa-regular fa-message"></i>
            <span style="font-size:13px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Token Rate Limiting Logic</span>
          </div>
        `;
      }

      if (messages) {
        messages.innerHTML = `
          <div class="message-row user" style="display:flex; justify-content:flex-end; margin-bottom:20px; gap:12px;">
            <div class="message-bubble" style="max-width:70%; background:#7c3aed; color:#fff; border-radius:14px 14px 2px 14px; padding:12px 18px; font-size:14px; line-height:1.5;">
              Can you generate a resilient SSE streaming client hook in React 18 with automatic abort controller handling?
            </div>
            <div class="avatar" style="width:34px; height:34px; border-radius:50%; background:#6d28d9; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#fff; font-size:13px;">U</div>
          </div>

          <div class="message-row assistant" style="display:flex; justify-content:flex-start; margin-bottom:20px; gap:12px;">
            <div class="avatar" style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #a855f7, #3b82f6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px;">✨</div>
            <div class="message-bubble" style="max-width:75%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#e2e8f0; border-radius:14px 14px 14px 2px; padding:16px 20px; font-size:14px; line-height:1.6;">
              <p style="margin-bottom:12px;">Here is an optimized React 18 custom hook engineered for real-time Server-Sent Events (SSE) streaming with low latency and clean cancellation cleanup:</p>
              
              <div style="background:#090d16; border-radius:8px; border:1px solid rgba(255,255,255,0.08); overflow:hidden; margin-top:8px;">
                <div style="background:#111827; padding:8px 14px; font-size:11px; font-weight:600; color:#94a3b8; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06);">
                  <span>typescript — useEventStream.ts</span>
                  <span style="color:#a855f7;">Gemini 3.5 Flash Streaming</span>
                </div>
                <pre style="padding:14px; margin:0; font-family:monospace; font-size:12px; color:#38bdf8; line-height:1.5; overflow-x:auto;">
export function useEventStream(url: string) {
  const [data, setData] = useState&lt;string&gt;("");
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback(async (prompt: string) => {
    setIsStreaming(true);
    const controller = new AbortController();
    const response = await fetch(url, { signal: controller.signal });
    // Process real-time stream tokens...
  }, [url]);

  return { data, isStreaming, startStream };
}</pre>
              </div>
            </div>
          </div>
        `;
      }
    });

    await new Promise((r) => setTimeout(r, 1000));
    const dest = path.join(process.cwd(), "public", "images", "projects", "ai-chatbot.png");
    await page.screenshot({ path: dest });
    console.log("✓ Saved inner AI Chatbot screenshot to:", dest);
  } catch (err) {
    console.error("AI Chatbot error:", err);
  } finally {
    await browser.close();
  }
}

main();
