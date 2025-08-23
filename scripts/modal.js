#!/usr/bin/env node
"use strict";

import { execSync } from "child_process";
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

let pkg = { name: "modal", version: "1.0.0", bin: { modal: "scripts/modal.js" } };
try {
  const pkgPath = resolve(projectRoot, "package.json");
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch {}

const binCandidates = pkg?.bin ? Object.keys(pkg.bin) : [];
const BIN = "pnpm modal";

const isTTY = process.stdout.isTTY;
const useColor = (isTTY && !("NO_COLOR" in process.env)) || ("FORCE_COLOR" in process.env);
const wrap = (open, close) => (s) => (useColor ? `\x1b[${open}m${s}\x1b[${close}m` : String(s));
const c = { bold: wrap(1, 22), dim: wrap(2, 22), underline: wrap(4, 24), red: wrap(31, 39), green: wrap(32, 39), yellow: wrap(33, 39), blue: wrap(34, 39), magenta: wrap(35, 39), cyan: wrap(36, 39), gray: wrap(90, 39) };
const S = { ok: "✔", fail: "✖", info: "ℹ", warn: "⚠", dot: "•", pointer: "➜" };
const t = () => c.gray(new Date().toLocaleTimeString());
const log = { info: (msg) => console.log(`${t()} ${c.cyan(S.info)} ${msg}`), ok: (msg) => console.log(`${t()} ${c.green(S.ok)} ${msg}`), warn: (msg) => console.warn(`${t()} ${c.yellow(S.warn)} ${msg}`), err: (msg) => console.error(`${t()} ${c.red(S.fail)} ${msg}`), step: (msg) => console.log(`${t()} ${c.blue(S.pointer)} ${msg}`) };

function parseArgv(argv) {
  const out = { _: [], flags: {} };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      out._.push(...args.slice(i + 1));
      break;
    } else if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq !== -1) {
        const k = a.slice(2, eq);
        const v = a.slice(eq + 1);
        out.flags[k] = v === "" ? true : v;
      } else {
        const key = a.slice(2);
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          out.flags[key] = args[i + 1];
          i++;
        } else {
          out.flags[key] = true;
        }
      }
    } else if (a.startsWith("-") && a.length > 1) {
      for (const ch of a.slice(1)) out.flags[ch] = true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

function commandFilePath(name) {
  return resolve(projectRoot, "src", "interactions", "modals", `${name}.ts`);
}
function ensureDirFor(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
function run(cmd) {
  log.step(`Running ${c.bold(cmd)}`);
  try {
    execSync(cmd, { stdio: "inherit" });
    log.ok(`Done: ${cmd}`);
  } catch (e) {
    log.err(`Command failed: ${cmd}`);
    if (e?.status) process.exitCode = e.status;
  }
}

function printHelp() {
  const header = `${c.bold(c.magenta(BIN.toUpperCase()))} ${c.dim(`v${pkg.version}`)}\n${c.gray("A tiny CLI to scaffold Discord modal files")}`;
  const usage = `${c.bold("Usage")}\n  ${c.bold(BIN)} ${c.cyan("create")} ${c.yellow("[name]")}\n  ${c.bold(BIN)} ${c.cyan("remove")} ${c.yellow("<name>")}\n  ${c.bold(BIN)} ${c.cyan("clear")}\n  ${c.bold(BIN)} ${c.cyan("--help")} | ${c.cyan("--version")}`;
  const options = `${c.bold("Options")}\n  -h, --help           Show this help\n  -v, --version        Show version\n  --name <n>           Alternate way to pass name`;
  const examples = `${c.bold("Examples")}\n  ${BIN} ${c.cyan("create")} custom-id\n  ${BIN} ${c.cyan("remove")} custom-id\n  ${BIN} ${c.cyan("clear")}`;
  console.log(["", header, "", usage, "", options, "", examples, "", c.dim("Tip: set NO_COLOR=1 to disable colors; FORCE_COLOR=1 to force them."), ""].join("\n"));
}

function main() {
  const { _: args, flags } = parseArgv(process.argv);
  if (process.env.DEBUG_FLAGS) {
    console.log("DEBUG - args:", args);
    console.log("DEBUG - flags:", flags);
  }
  if (flags.h || flags.help) return printHelp();
  if (flags.v || flags.version) return console.log(pkg.version);
  const command = args[0] ?? "";
  switch (command) {
    case "create": {
      const name = args[1] ?? flags.name ?? "new-modal";
      const content = `import { Modal } from '../../types/index.js';

const args = [] as const;

export default {
    customId: '${name}',
    args,
    async execute(interaction, args) {
        await interaction.deferReply();

        await interaction.reply2('Placeholder response.');
    }
} satisfies Modal<typeof args>;
`;
      const filePath = commandFilePath(name);
      ensureDirFor(filePath);
      try {
        writeFileSync(filePath, content, "utf8");
        log.ok(`Created ${c.bold(`src/interactions/modals/${name}.ts`)}`);
      } catch (e) {
        log.err(`Failed to write file: ${filePath}`);
        process.exitCode = 1;
        return;
      }
      run("pnpm update-modals");
      log.ok("Modal list updated");
      break;
    }
    case "remove": {
      const name = args[1] ?? flags.name ?? "";
      if (!name) {
        log.err("No modal name specified.");
        process.exitCode = 1;
        return;
      }
      const filePath = commandFilePath(name);
      if (!existsSync(filePath)) {
        log.warn(`No such modal file: ${c.bold(`src/interactions/modals/${name}.ts`)}`);
      } else {
        try {
          unlinkSync(filePath);
          log.ok(`Removed ${c.bold(`src/interactions/modals/${name}.ts`)}`);
        } catch (e) {
          log.err(`Failed to remove file: ${filePath}`);
          process.exitCode = 1;
          return;
        }
      }
      run("pnpm update-modals");
      log.ok("Modal list updated");
      break;
    }
    case "clear": {
      const dir = resolve(projectRoot, "src", "interactions", "modals");
      if (!existsSync(dir)) {
        log.warn('No such directory: ' + c.bold('src/interactions/modals'));
      } else {
        const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
        if (files.length === 0) log.info("No files to remove.");
        for (const f of files) {
          const fp = resolve(dir, f);
          try {
            unlinkSync(fp);
            log.ok('Removed ' + c.bold('src/interactions/modals/' + f));
          } catch (e) {
            log.err('Failed to remove file: ' + fp);
            process.exitCode = 1;
            return;
          }
        }
      }
      run("pnpm update-modals");
      log.ok("Modal list updated");
      break;
    }
    default: {
      log.err(`Unknown command: ${command || "(none)"}`);
      printHelp();
      process.exitCode = 1;
    }
  }
}

main();
