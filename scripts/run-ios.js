/**
 * Launch the iOS app that matches API_ENV in `.env`.
 *
 * `react-native run-ios` otherwise defaults to the WApp scheme,
 * which is the live app (live.worldener.app).
 */
const { spawn } = require("child_process");
const path = require("path");
const { loadEnvFile } = require("./loadEnvFile");

const root = path.join(__dirname, "..");
loadEnvFile(path.join(root, ".env"));

const apiEnv = String(process.env.API_ENV || "production").trim().toLowerCase();
const scheme = apiEnv === "uat" ? "WApp UAT" : "WApp";
const extra = process.argv.slice(2);
const hasScheme = extra.includes("--scheme");

console.log(
  `API_ENV=${apiEnv || "production"} → iOS scheme "${hasScheme ? "(from args)" : scheme}"`
);

const child = spawn(
  path.join(root, "node_modules", ".bin", "react-native"),
  ["run-ios", ...(hasScheme ? [] : ["--scheme", scheme]), ...extra],
  { stdio: "inherit", cwd: root }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code == null ? 1 : code);
});
