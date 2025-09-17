const store = require('./dataStore');

const FILE = 'discounts.json';

async function all() { return store.read(FILE); }
async function save(list) { return store.write(FILE, list); }

async function findByCode(code) {
  const list = await all();
  const c = (code || '').trim().toLowerCase();
  return list.find(x => (x.code || '').toLowerCase() === c) || null;
}

async function markUsed(id) {
  const list = await all();
  const i = list.findIndex(x => x.id === id);
  if (i >= 0) {
    list[i].used = true;
    await save(list);
  }
}

module.exports = { all, save, findByCode, markUsed };
