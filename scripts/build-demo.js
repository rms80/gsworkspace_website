#!/usr/bin/env node

/**
 * Builds the gsworkspace offline demo if the submodule has changed.
 * Uses caching to skip rebuilds when the submodule commit hash is unchanged.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SUBMODULE_PATH = join(ROOT, '.gsworkspace');
const FRONTEND_PATH = join(SUBMODULE_PATH, 'frontend');
const DEMO_OUTPUT = join(ROOT, 'public', 'demo');
const CACHE_DIR = join(ROOT, 'node_modules', '.cache', 'gsworkspace-demo');
const HASH_FILE = join(CACHE_DIR, 'commit-hash');

function getSubmoduleHash() {
  try {
    return execSync('git rev-parse HEAD', {
      cwd: SUBMODULE_PATH,
      encoding: 'utf8'
    }).trim();
  } catch (e) {
    console.error('Failed to get submodule hash. Is the submodule initialized?');
    console.error('Run: git submodule update --init');
    process.exit(1);
  }
}

function getCachedHash() {
  try {
    if (existsSync(HASH_FILE)) {
      return readFileSync(HASH_FILE, 'utf8').trim();
    }
  } catch (e) {
    // Ignore read errors
  }
  return null;
}

function saveHash(hash) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(HASH_FILE, hash);
}

function buildDemo() {
  const absoluteBuildOutDir = join(SUBMODULE_PATH, 'install', 'offline', 'dist');

  // Clean previous build
  if (existsSync(absoluteBuildOutDir)) {
    rmSync(absoluteBuildOutDir, { recursive: true });
  }

  // Use the original build script which handles everything correctly
  console.log('Running gsworkspace offline build script...');

  // Always use bash script - works on Linux, macOS, and Windows (via Git Bash/WSL)
  execSync('bash build-linux.sh', {
    cwd: join(SUBMODULE_PATH, 'install', 'offline'),
    stdio: 'inherit',
    shell: true
  });

  // Copy to public/demo
  console.log('Copying to public/demo...');
  if (existsSync(DEMO_OUTPUT)) {
    rmSync(DEMO_OUTPUT, { recursive: true });
  }
  mkdirSync(DEMO_OUTPUT, { recursive: true });
  cpSync(absoluteBuildOutDir, DEMO_OUTPUT, { recursive: true });
}

function main() {
  console.log('=== gsworkspace Demo Build ===\n');

  // Check if submodule exists
  if (!existsSync(FRONTEND_PATH)) {
    console.error('Submodule not found at .gsworkspace');
    console.error('Run: git submodule update --init');
    process.exit(1);
  }

  const currentHash = getSubmoduleHash();
  const cachedHash = getCachedHash();
  const demoExists = existsSync(join(DEMO_OUTPUT, 'index.html'));

  console.log(`Current submodule: ${currentHash.slice(0, 8)}`);
  console.log(`Cached hash:       ${cachedHash ? cachedHash.slice(0, 8) : '(none)'}`);
  console.log(`Demo exists:       ${demoExists}\n`);

  if (currentHash === cachedHash && demoExists) {
    console.log('Demo is up to date, skipping build.\n');
    return;
  }

  if (currentHash !== cachedHash) {
    console.log('Submodule has changed, rebuilding...\n');
  } else {
    console.log('Demo files missing, rebuilding...\n');
  }

  buildDemo();
  saveHash(currentHash);

  console.log('\nDemo build complete!');
}

main();
