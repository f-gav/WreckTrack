import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const versionMatch = html.match(/CURRENT_SCHEMA_VERSION=(\d+)/);
assert.ok(versionMatch, 'CURRENT_SCHEMA_VERSION not found');
const CURRENT_SCHEMA_VERSION = Number(versionMatch[1]);

const start = html.indexOf('function archiveSchemaVersion');
const end = html.indexOf('function loadState');
assert.ok(start >= 0 && end > start, 'Migration functions not found');

const source = html.slice(start, end);
const context = { CURRENT_SCHEMA_VERSION };
vm.createContext(context);
vm.runInContext(source + '\nthis.archiveSchemaVersion=archiveSchemaVersion;this.migrateArchive=migrateArchive;', context);

const { archiveSchemaVersion, migrateArchive } = context;

{
  const legacy = { rooms: [], bestiary: [] };
  assert.equal(archiveSchemaVersion(legacy), 0);
  const migrated = migrateArchive(legacy);
  assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(migrated.tags, []);
}

{
  const current = { schemaVersion: CURRENT_SCHEMA_VERSION, rooms: [], bestiary: [], tags: [] };
  const migrated = migrateArchive(current);
  assert.equal(migrated, current);
  assert.equal(migrated.schemaVersion, CURRENT_SCHEMA_VERSION);
}

{
  const malformed = migrateArchive(null);
  assert.equal(malformed.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(malformed.rooms, []);
  assert.deepEqual(malformed.bestiary, []);
  assert.deepEqual(malformed.tags, []);
}

{
  assert.throws(
    () => migrateArchive({ schemaVersion: CURRENT_SCHEMA_VERSION + 1, rooms: [], bestiary: [], tags: [] }),
    /новее поддерживаемой/
  );
}

console.log('schema-version smoke tests passed');
