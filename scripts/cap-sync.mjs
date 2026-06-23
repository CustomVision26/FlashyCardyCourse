import { execSync } from "node:child_process";

const targets = {
  // Android
  emulator: "http://10.0.2.2:3002",
  device: "http://192.168.1.78:3002",
  // iOS — the Simulator shares the Mac's network, so localhost works.
  // A physical iPhone must use the Mac's LAN IP (same as `device`).
  ios: "http://localhost:3002",
  "ios-device": "http://192.168.1.78:3002",
};

const target = process.argv[2] ?? "emulator";
const serverUrl = process.argv[3] ?? targets[target];

if (!serverUrl) {
  console.error(
    `Unknown target "${target}". Use: emulator | device | or pass a full URL.`,
  );
  process.exit(1);
}

process.env.CAPACITOR_SERVER_URL = serverUrl;
console.log(`Capacitor server URL: ${serverUrl}`);

execSync("npx cap sync", { stdio: "inherit", env: process.env });
