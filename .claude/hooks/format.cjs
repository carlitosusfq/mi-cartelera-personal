
const fs = require('node:fs/promises');
const path = require('node:path');
const prettier = require('prettier');

async function main() {
  let input = '';

  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (!input.trim()) return;

  const event = JSON.parse(input);
  const filePath = event.tool_input?.file_path;

  if (typeof filePath !== 'string') return;

  const projectRoot = process.cwd();
  const absolutePath = path.resolve(projectRoot, filePath);
  const relativePath = path.relative(projectRoot, absolutePath);

  if (
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath)
  ) return;

  if (!/\.(ts|tsx|js|jsx|css|json)$/.test(absolutePath)) return;

  const info = await prettier.getFileInfo(absolutePath, {
    ignorePath: path.join(projectRoot, '.prettierignore'),
  });

  if (info.ignored) return;

  const original = await fs.readFile(absolutePath, 'utf8');
  const config = (await prettier.resolveConfig(absolutePath)) || {};

  const formatted = await prettier.format(original, {
    ...config,
    filepath: absolutePath,
  });

  if (formatted !== original) {
    await fs.writeFile(absolutePath, formatted, 'utf8');
    console.error(`Prettier: ${relativePath}`);
  }
}

main().catch((error) => {
  console.error('Error del hook Prettier:', error.message);
  process.exitCode = 1;
});
