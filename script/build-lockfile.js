'use strict';
// Build a root package-lock.json from npm's hidden lockfile
// (node_modules/.package-lock.json) so that installs are reproducible without
// needing a registry round trip. The hidden lockfile records exactly what is
// installed, so this produces the same lockfile npm would have written.
//
// Run from the repo root:  node script/build-lockfile.js
const fs = require('fs');
const path = require('path');

const root = process.argv[2] || process.cwd();
const pkgPath = path.join(root, 'package.json');
const hiddenPath = path.join(root, 'node_modules', '.package-lock.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

let hidden;
if (fs.existsSync(hiddenPath)) {
  hidden = JSON.parse(fs.readFileSync(hiddenPath, 'utf8'));
} else {
  console.error('No hidden lockfile at ' + hiddenPath);
  console.error('Run `npm install` once to populate node_modules, then re-run this script.');
  process.exit(1);
}

const packages = {};

// The root entry: what npm puts in `""` describing this project itself.
packages[''] = {
  name: pkg.name,
  version: pkg.version,
  license: pkg.license,
  dependencies: pkg.dependencies,
  devDependencies: pkg.devDependencies,
  bin: pkg.bin,
  engines: pkg.engines
};
for (const key of Object.keys(packages[''])) {
  if (packages[''][key] === undefined) delete packages[''][key];
}
if (packages[''].dependencies) packages[''].dependencies = pkg.dependencies;

for (const [loc, entry] of Object.entries(hidden.packages || {})) {
  // Carry over the dev / optional / peer markers npm recorded.
  const copy = Object.assign({}, entry);
  packages[loc] = copy;
}

// Drop entries whose resolved dependency is no longer declared in package.json
// at the top level and are not reachable -- npm would prune them. Keep it simple
// and safe: only prune root-level duplicates that no longer match a range.
function satisfiesRange(version, range) {
  if (!range || range === '*' || range === 'latest') return true;
  const cleaned = range.trim();
  const m = /^([\^~>=<]*)\s*(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?/.exec(cleaned);
  if (!m) return true;
  const op = m[1];
  const target = [Number(m[2]), Number(m[3] || 0), Number(m[4] || 0)];
  const parts = String(version).split('.').map((n) => Number(n));
  if (parts.some((n) => Number.isNaN(n))) return true;
  for (let i = 0; i < 3; i += 1) {
    if (op === '^') {
      if (parts[i] !== target[i]) return i === 0 ? parts[i] === target[i] : true;
      if (i === 0 && target[0] > 0) return true;
    } else if (op === '~') {
      if (parts[i] !== target[i]) return true;
      return true;
    } else {
      if (parts[i] !== target[i]) return false;
    }
  }
  return true;
}

const declared = Object.assign({}, pkg.dependencies, pkg.devDependencies);
const topLevel = {};
for (const loc of Object.keys(packages)) {
  if (loc === '') continue;
  const match = /^node_modules\/(.+)$/.exec(loc);
  if (!match) continue;
  const name = match[1];
  if (!topLevel[name]) topLevel[name] = packages[loc];
}
for (const [name, range] of Object.entries(declared)) {
  const entry = topLevel[name];
  if (!entry) {
    console.warn('warning: ' + name + ' is declared but not installed; run `npm install`');
    continue;
  }
  if (entry.version && !satisfiesRange(entry.version, range)) {
    console.error('error: installed ' + name + '@' + entry.version + ' does not satisfy "' + range + '"');
    process.exitCode = 1;
  }
}

const sortedKeys = Object.keys(packages).sort();
const sorted = {};
for (const key of sortedKeys) sorted[key] = packages[key];

const lock = {
  name: pkg.name,
  version: pkg.version,
  lockfileVersion: 3,
  requires: true,
  packages: sorted
};

fs.writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n');
console.log('wrote package-lock.json with ' + (sortedKeys.length - 1) + ' packages');