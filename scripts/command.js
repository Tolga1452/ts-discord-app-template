#!/usr/bin/env node
"use strict";

import { execSync } from "child_process";
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

let pkg = { name: "command", version: "1.0.0", bin: { command: "scripts/command.js" } };
try {
  const pkgPath = resolve(projectRoot, "package.json");
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch {}

const binCandidates = pkg?.bin ? Object.keys(pkg.bin) : [];
const BIN = "pnpm command";

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
  const multiCharShorts = new Set(["ac"]);
  const valueShorts = new Set(["g"]);
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
      const body = a.slice(1);
      const eq = body.indexOf("=");
      const keyBody = eq !== -1 ? body.slice(0, eq) : body;
      const valPart = eq !== -1 ? body.slice(eq + 1) : null;
      if (multiCharShorts.has(keyBody)) {
        out.flags[keyBody] = valPart ?? true;
      } else if (valueShorts.has(keyBody)) {
        if (valPart != null) {
          out.flags[keyBody] = valPart;
        } else if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          out.flags[keyBody] = args[i + 1];
          i++;
        } else {
          out.flags[keyBody] = true;
        }
      } else if (keyBody.length > 1) {
        for (const ch of keyBody) out.flags[ch] = true;
      } else {
        out.flags[keyBody] = true;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function commandFilePath(name) {
  return resolve(projectRoot, "src", "interactions", "commands", `${name}.ts`);
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
  const header = `${c.bold(c.magenta(BIN.toUpperCase()))} ${c.dim(`v${pkg.version}`)}\n${c.gray("A tiny CLI to scaffold Discord command files (slash/user/message)")}`;
  const usage = `${c.bold("Usage")}\n  ${c.bold(BIN)} ${c.cyan("create")} ${c.yellow("<type>")} ${c.yellow("[name]")} [-ac]\n  ${c.bold(BIN)} ${c.cyan("remove")} ${c.yellow("<name>")}\n  ${c.bold(BIN)} ${c.cyan("clear")}\n  ${c.bold(BIN)} ${c.cyan("--help")} | ${c.cyan("--version")}`;
  const types = `${c.bold("Types")}\n  ${c.cyan("slash")}     Create a slash command (optionally with ${c.bold("-ac")} autocomplete)\n  ${c.cyan("user")}      Create a user context menu command\n  ${c.cyan("message")}   Create a message context menu command\n  ${c.cyan("activity")}   Create a primary entry point command`;
  const options = `${c.bold("Options")}\n  -h, --help                 Show this help\n  -v, --version              Show version\n  -ac, --autocomplete  Include autocomplete handler (slash only)\n  -g <g>, --guild <g>        Guild ID to restrict command to (for slash/user/message commands)\n  --type <t>                 Alternate way to pass type\n  --name <n>                 Alternate way to pass name`;
  const examples = `${c.bold("Examples")}\n  ${BIN} ${c.cyan("create")} slash ping ${c.gray("-ac")}\n  ${BIN} ${c.cyan("create")} user whois\n  ${BIN} ${c.cyan("remove")} ping\n  ${BIN} ${c.cyan("clear")}`;
  console.log(["", header, "", usage, "", types, "", options, "", examples, "", c.dim("Tip: set NO_COLOR=1 to disable colors; FORCE_COLOR=1 to force them."), ""].join("\n"));
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
      const type = args[1] ?? flags.type ?? "slash";
      const name = args[2] ?? flags.name ?? "new-command";
      const autocomplete = flags.ac || flags.autocomplete || false;
      const guild = flags.g ?? flags.guild;
      log.step(`Scaffolding ${c.cyan(type)} command ${c.bold(name)}`);
      let content = "";
      if (type === "slash") {
        content = `import { ${autocomplete ? "ApplicationCommandOptionChoiceData, " : ""}ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommand } from '../../types/index.js';

export default {
${guild ? `    guild: '${guild}',` : ""}
    data: new SlashCommandBuilder()
        .setName('${name}')
        .setDescription('Placeholder description.')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        await interaction.reply2('Placeholder response.');
    }${autocomplete ? `,
    async autocomplete(interaction) {
        const option = interaction.options.getFocused(true);
        const choices: ApplicationCommandOptionChoiceData[] = [];

        switch (option.name) {
            case '': {
                choices.push({ name: 'Choice 1', value: 'choice1' });

                break;
            };
        };

        await interaction.respond(choices);
    }` : ""}
} satisfies ChatInputCommand;
`;
      } else if (type === "user") {
        content = `import { ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType } from 'discord.js';
import { UserContextMenuCommand } from '../../types/index.js';

export default {
${guild ? `    guild: '${guild}',` : ""}
    data: new ContextMenuCommandBuilder()
        .setType(2)
        .setName('${name}')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.targetUser;

        await interaction.reply2(user.username);
    }
} satisfies UserContextMenuCommand;
`;
      } else if (type === "message") {
        content = `import { ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType } from 'discord.js';
import { MessageContextMenuCommand } from '../../types/index.js';

export default {
${guild ? `    guild: '${guild}',` : ""}
    data: new ContextMenuCommandBuilder()
        .setType(3)
        .setName('${name}')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
    async execute(interaction) {
        await interaction.deferReply();

        const message = interaction.targetMessage;

        await interaction.reply2(message.content);
    }
} satisfies MessageContextMenuCommand;
`;
      } else if (type === "activity") {
        content = `import { ApplicationCommandType, EntryPointCommandHandlerType } from 'discord.js';
import { PrimaryEntryPointCommand } from '../../types/index.js';

export default {
    data: {
        type: ApplicationCommandType.PrimaryEntryPoint,
        name: '${name}',
        description: 'Placeholder description.',
        handler: EntryPointCommandHandlerType.DiscordLaunchActivity
    }
} satisfies PrimaryEntryPointCommand;
`;
      } else {
        log.err(`Unknown command type: ${type}`);
        process.exitCode = 1;
        return;
      }
      const filePath = commandFilePath(name.replaceAll(" ", "-"));
      ensureDirFor(filePath);
      try {
        writeFileSync(filePath, content, "utf8");
        log.ok(`Created ${c.bold(`src/interactions/commands/${name}.ts`)}`);
      } catch (e) {
        log.err(`Failed to write file: ${filePath}`);
        process.exitCode = 1;
        return;
      }
      run("pnpm update-cmds");
      log.ok("Command list updated");
      break;
    }
    case "remove": {
      const name = args[1] ?? flags.name ?? "";
      if (!name) {
        log.err("No command name specified.");
        process.exitCode = 1;
        return;
      }
      const filePath = commandFilePath(name);
      if (!existsSync(filePath)) {
        log.warn(`No such command file: ${c.bold(`src/interactions/commands/${name}.ts`)}`);
      } else {
        try {
          unlinkSync(filePath);
          log.ok(`Removed ${c.bold(`src/interactions/commands/${name}.ts`)}`);
        } catch (e) {
          log.err(`Failed to remove file: ${filePath}`);
          process.exitCode = 1;
          return;
        }
      }
      run("pnpm update-cmds");
      log.ok("Command list updated");
      break;
    }
    case "clear": {
      const dir = resolve(projectRoot, "src", "interactions", "commands");
      if (!existsSync(dir)) {
        log.warn('No such directory: ' + c.bold('src/interactions/commands'));
      } else {
        const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
        if (files.length === 0) {
          log.info("No files to remove.");
        }
        for (const f of files) {
          const fp = resolve(dir, f);
          try {
            unlinkSync(fp);
            log.ok('Removed ' + c.bold('src/interactions/commands/' + f));
          } catch (e) {
            log.err('Failed to remove file: ' + fp);
            process.exitCode = 1;
            return;
          }
        }
      }
      run("pnpm update-cmds");
      log.ok("Command list updated");
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
