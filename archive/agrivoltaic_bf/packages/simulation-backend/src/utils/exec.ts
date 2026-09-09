import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import type { RadianceCommandLogEntry, RadianceCommandSpec } from "@agrivoltaic/shared";

function shellQuote(part: string): string {
  return `'${part.replace(/'/g, `'\\''`)}'`;
}

export function formatCommand(command: RadianceCommandSpec): string {
  return [command.program, ...command.args].map(shellQuote).join(" ");
}

export async function executeCommand(
  packageRoot: string,
  command: RadianceCommandSpec,
): Promise<RadianceCommandLogEntry> {
  const cwd = join(packageRoot, command.cwdRelative);
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const stdoutPath = command.stdoutRelativePath ? join(packageRoot, command.stdoutRelativePath) : undefined;
  const stderrPath = join(packageRoot, "logs", `${command.id}.stderr.txt`);
  const stderrChunks: string[] = [];

  await mkdir(cwd, { recursive: true });
  await mkdir(dirname(stderrPath), { recursive: true });
  if (stdoutPath) {
    await mkdir(dirname(stdoutPath), { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command.program, command.args, { cwd });
    const stderrFile = createWriteStream(stderrPath);
    const stdoutFile = stdoutPath ? createWriteStream(stdoutPath) : undefined;

    if (command.stdinRelativePath) {
      createReadStream(join(packageRoot, command.stdinRelativePath)).pipe(child.stdin);
    } else {
      child.stdin.end();
    }

    if (stdoutFile) {
      child.stdout.pipe(stdoutFile);
    }

    child.stdout.on("data", (chunk) => {
      if (!stdoutFile) {
        stderrChunks.push(chunk.toString());
      }
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderrChunks.push(text);
      stderrFile.write(text);
    });

    child.on("error", (error) => {
      stderrFile.end();
      stdoutFile?.end();
      reject(new Error(`Failed to start ${command.program}: ${error.message}`));
    });

    child.on("close", (code) => {
      stderrFile.end();
      stdoutFile?.end();

      const endedAt = new Date().toISOString();
      const entry: RadianceCommandLogEntry = {
        id: command.id,
        command: formatCommand(command),
        cwd,
        startedAt,
        endedAt,
        durationMs: Date.now() - startedMs,
        exitCode: code ?? -1,
        stdoutPath: command.stdoutRelativePath,
        stderrPath: "logs/" + `${command.id}.stderr.txt`,
      };

      if (code !== 0) {
        reject(new Error(`${command.id} failed with exit code ${code ?? -1}: ${stderrChunks.join("").trim()}`));
        return;
      }

      resolve(entry);
    });
  });
}
