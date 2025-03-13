import { build } from "esbuild";
import fs from "fs";
import path from "path";
import deps from "./plugins/deps.mjs";

const rootDir = path.resolve();
const outputServerDir = path.join(rootDir, "packages/core");
const outputClientDir = path.join(rootDir, "client_packages");

function clearOutput() {
  if (fs.existsSync(outputClientDir)) {
    fs.rmSync(outputClientDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputClientDir, { recursive: true });

  if (fs.existsSync(outputServerDir)) {
    fs.rmSync(outputServerDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputServerDir, { recursive: true });
}

async function buildProject() {
  console.time("Общее время сборки");
  clearOutput();

  console.time("Сборка клиентской части");

  const clientBuildOptions = {
    entryPoints: [`${rootDir}/src/client/index.ts`],
    bundle: true,
    target: "esnext",
    outfile: `${outputClientDir}/index.js`,
    external: [],
    sourcemap: true,
    minify: false,
    format: "esm",
  };

  await build(clientBuildOptions);
  console.timeEnd("Сборка клиентской части");

  console.time("Сборка серверной части");

  const serverBuildOptions = {
    entryPoints: [`${rootDir}/src/server/index.ts`],
    bundle: true,
    platform: "node",
    target: "esnext",
    outfile: `${outputServerDir}/index.js`,
    sourcemap: true,
    minify: false,
    format: "cjs",
    plugins: [deps],
  };

  await build(serverBuildOptions);
  console.timeEnd("Сборка серверной части");
  console.timeEnd("Общее время сборки");
}

buildProject().catch((err) => {
  console.error(err);
  process.exit(1);
});
