const http = require("node:http");
const { mkdir, readFile } = require("node:fs/promises");
const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const screenshotDir = path.join(root, "screenshots");
const chrome =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });

  const server = http.createServer((request, response) => {
    const file = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const filePath = path.join(root, decodeURIComponent(file));
    const extension = path.extname(filePath);
    const types = {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".png": "image/png",
    };

    readFile(filePath)
      .then((contents) => {
        response.writeHead(200, {
          "Cache-Control": "no-store",
          "Content-Type": types[extension] ?? "application/octet-stream",
        });
        response.end(contents);
      })
      .catch(() => {
        response.writeHead(404);
        response.end("Not found");
      });
  });

  await new Promise((resolve) => server.listen(3200, "127.0.0.1", resolve));

  try {
    const commonArgs = [
      "--headless=new",
      "--disable-gpu",
      "--disable-gpu-compositing",
      "--disable-software-rasterizer",
      "--disable-features=UseSkiaRenderer,VizDisplayCompositor",
      "--no-sandbox",
      "--hide-scrollbars",
      "--virtual-time-budget=10000",
      "http://127.0.0.1:3200",
    ];

    await run(chrome, [
      "--window-size=1440,1100",
      `--screenshot=${path.join(screenshotDir, "country-explorer-desktop.png")}`,
      ...commonArgs,
    ]);

    await run(chrome, [
      "--window-size=390,900",
      `--screenshot=${path.join(screenshotDir, "country-explorer-mobile.png")}`,
      ...commonArgs,
    ]);
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
