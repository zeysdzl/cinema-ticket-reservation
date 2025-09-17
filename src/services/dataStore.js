const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');

async function ensureFile(filePath, fallback = '[]') {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fallback, 'utf-8');
  }
}

async function read(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  await ensureFile(filePath, '[]');
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw || '[]');
}

async function write(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  await ensureFile(filePath);
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  // atomic-ish replace
  fssync.renameSync(tmp, filePath);
  return true;
}

module.exports = { read, write, DATA_DIR };
