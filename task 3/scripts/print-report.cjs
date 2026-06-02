const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const pdf = path.join(root, "Task-3-API-Project-Report.pdf");
const report = "file:///" + path.join(root, "report.html").replace(/\\/g, "/");

const args = [
  "--headless=new",
  "--disable-gpu",
  "--disable-gpu-compositing",
  "--disable-software-rasterizer",
  "--disable-features=UseSkiaRenderer,VizDisplayCompositor",
  "--no-sandbox",
  "--print-to-pdf-no-header",
  `--print-to-pdf=${pdf}`,
  report,
];

const child = spawn(chrome, args, {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
