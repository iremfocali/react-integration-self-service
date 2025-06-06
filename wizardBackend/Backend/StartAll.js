const { spawn } = require("child_process");

const scripts = ["./XMLStreamer.js", "./WebPushScriptChecker.js", "./ServiceWorkerChecker.js", "./ServerSideRequestChecker.js", "./OfflineEventChecker.js", "./EventTracker.js"];

console.log("Starting all services...");

scripts.forEach((script) => {
  console.log(`Starting ${script}...`);
  const process = spawn("node", [script], { stdio: "inherit" });

  process.on("error", (err) => {
    console.error(`Failed to start ${script}:`, err);
  });

  process.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${script} exited with code ${code}`);
    } else {
      console.log(`${script} started successfully`);
    }
  });
});
