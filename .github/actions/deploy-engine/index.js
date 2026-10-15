'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

class EngineError extends Error {}

const state = {
  tempBase: null,
  symlinks: [],
  deployments: [],
  knownHostsPath: null,
  knownHostAdded: []
};

function emitError(msg) { console.error('::error::' + msg); }
function fail(msg) { throw new EngineError(msg); }

// Documented engine v1 choice: generated env values come from node crypto.randomBytes(32).toString('hex').
function maskValues(content) {
  for (const line of content.split('\n')) {
    const m = /^([^#\n][^=\n]*?)=(.*)$/.exec(line);
    if (m) {
      const value = m[2].trim();
      if (value.length >= 4) console.error('::add-mask::' + value);
    }
  }
}

// context.host shape: [user@]host[:port]
function parseSshSpec(spec) {
  let user = null;
  let rest = spec;
  const at = spec.indexOf('@');
  if (at !== -1) { user = spec.slice(0, at); rest = spec.slice(at + 1); }
  let host = rest;
  let port = '22';
  const idx = rest.lastIndexOf(':');
  if (idx !== -1) { host = rest.slice(0, idx); port = rest.slice(idx + 1); }
  return { user, host, port };
}

function validate(env) {
  const manifestPath = path.resolve(env.workspace, env.manifest);
  let raw;
  try { raw = fs.readFileSync(manifestPath, 'utf8'); } catch (e) { fail(`Unable to read manifest file: ${manifestPath}`); }
  let manifest;
  try { manifest = JSON.parse(raw); } catch (e) { fail(`Invalid JSON in manifest: ${manifestPath}`); }
  const errors = [];
  if (manifest.version !== 1) errors.push(`Manifest version must be 1, got ${String(manifest.version)}`);
  if (!Array.isArray(manifest.deployments)) {
    errors.push('deployments must be an array');
  } else {
    for (const dep of manifest.deployments) {
      if (typeof dep.name !== 'string' || dep.name === '') errors.push('Deployment name missing or empty');
      if (dep.platform !== 'docker') errors.push(`Deployment '${dep.name}' has unsupported platform '${dep.platform}'; deploy-engine v1 supports only docker`);
      if (!dep.context || typeof dep.context !== 'object') {
        errors.push(`Deployment '${dep.name}' context must be an object`);
      } else {
        const c = dep.context;
        if (c.type === 'socket') { /* ok */ }
        else if (c.type === 'ssh') {
          if (!c.host || typeof c.host !== 'string' || c.host === '') errors.push(`Deployment '${dep.name}' ssh context missing host`);
        } else {
          errors.push(`Deployment '${dep.name}' has unknown context type '${c.type}'`);
        }
      }
      if (typeof dep.project_name !== 'string' || dep.project_name === '') errors.push(`Deployment '${dep.name}' project_name missing or empty`);
      if (!Array.isArray(dep.env_files)) { errors.push(`Deployment '${dep.name}' env_files must be an array`); }
      else {
        for (const envf of dep.env_files) {
          if (typeof envf.path !== 'string' || envf.path === '') errors.push(`Deployment '${dep.name}' env_files entry missing path`);
          if (typeof envf.source !== 'string' || envf.source === '') { errors.push(`Deployment '${dep.name}' env_files entry missing source`); continue; }
          if (envf.source.startsWith('secret:')) errors.push(`Deployment '${dep.name}' env file '${envf.path}': secret sources are reserved for deploy-engine v2 and are refused`);
          if (envf.source.startsWith('file:')) {
            const rel = envf.source.slice(5);
            const resolved = path.resolve(env.workspace, rel);
            let realExists = false;
            try { fs.statSync(resolved); realExists = true; } catch (e) { errors.push(`Deployment '${dep.name}' env file '${envf.path}': file source '${rel}' does not exist`); }
            if (realExists) {
              const wsReal = fs.realpathSync(env.workspace);
              const real = fs.realpathSync(resolved);
              if (real !== wsReal && !real.startsWith(wsReal + path.sep)) errors.push(`Deployment '${dep.name}' env file '${envf.path}': file source '${rel}' escapes the checkout`);
            }
          } else if (envf.source !== 'generated') {
            errors.push(`Deployment '${dep.name}' env file '${envf.path}': unknown source '${envf.source}'`);
          }
        }
      }
      if (typeof dep.compose_file !== 'string' || dep.compose_file === '') errors.push(`Deployment '${dep.name}' compose_file missing`);
      else {
        const comp = path.resolve(env.workspace, dep.compose_file);
        try { const st = fs.statSync(comp); if (!st.isFile()) errors.push(`Deployment '${dep.name}' compose_file '${dep.compose_file}' is not a regular file`); }
        catch (e) { errors.push(`Deployment '${dep.name}' compose_file '${dep.compose_file}' does not exist`); }
      }
      const hc = dep.healthcheck;
      if (!hc || typeof hc !== 'object') { errors.push(`Deployment '${dep.name}' healthcheck must be an object`); }
      else {
        if (typeof hc.url !== 'string' || hc.url === '') errors.push(`Deployment '${dep.name}' healthcheck url missing`);
        if (!Number.isInteger(hc.retries) || hc.retries <= 0) errors.push(`Deployment '${dep.name}' healthcheck retries must be a positive integer`);
        if (!Number.isInteger(hc.interval_seconds) || hc.interval_seconds <= 0) errors.push(`Deployment '${dep.name}' healthcheck interval_seconds must be a positive integer`);
      }
    }
  }
  if (errors.length) { for (const e of errors) emitError(e); process.exit(1); }
  return manifest.deployments.map(dep => ({
    name: dep.name,
    platform: dep.platform,
    context: dep.context,
    project_name: dep.project_name,
    composeFile: path.resolve(env.workspace, dep.compose_file),
    env_files: dep.env_files,
    healthcheck: dep.healthcheck,
    attemptedDeploy: false,
    reachedDeploy: false,
    authSock: null,
    agentPid: null
  }));
}

function materialize(env) {
  fs.mkdirSync(state.tempBase, { mode: 0o700, recursive: true });
  for (const dep of state.deployments) {
    const dir = path.join(state.tempBase, 'envs', dep.project_name);
    fs.mkdirSync(dir, { mode: 0o700, recursive: true });
    for (const envf of dep.env_files) {
      // file: sources remain as real files at their declared checkout path and are read
      // in place by docker compose; only generated sources are materialized + symlinked.
      if (envf.source !== 'generated') { continue; }
      const content = `ENGINE_GENERATED_SECRET=${crypto.randomBytes(32).toString('hex')}\n`;
      const safeName = envf.path.split('/').join('__');
      const tmpFile = path.join(dir, safeName);
      fs.writeFileSync(tmpFile, content, { mode: 0o600 });
      maskValues(content);
      envf._tmpFile = tmpFile;
    }
  }
}

function placeSymlinks(env) {
  const wsReal = fs.realpathSync(env.workspace);
  for (const dep of state.deployments) {
    for (const envf of dep.env_files) {
      if (!envf._tmpFile) { continue; } // only entries materialized by this run are symlinked
      const link = path.resolve(env.workspace, envf.path);
      let isSym = false;
      let exists = false;
      try { const st = fs.lstatSync(link); exists = true; isSym = st.isSymbolicLink(); } catch (e) { }
      if (exists && !isSym) fail(`Refusing to overwrite existing real file ${link}`);
      let dirOf = path.dirname(link);
      if (dirOf === wsReal || dirOf.startsWith(wsReal + path.sep)) fs.mkdirSync(dirOf, { recursive: true });
      else fail(`Refusing to place checkout symlink outside workspace: ${link}`);
      if (isSym) fs.unlinkSync(link);
      fs.symlinkSync(envf._tmpFile, link);
      state.symlinks.push(link);
    }
  }
}

function setupSsh(dep, env) {
  if (!env.sshKey || !env.sshKey.trim()) fail(`Deployment '${dep.name}' uses an ssh context but DEPLOY_SSH_KEY is not set`);
  const sshDir = path.join(state.tempBase, 'ssh');
  fs.mkdirSync(sshDir, { mode: 0o700, recursive: true });
  const keyFile = path.join(sshDir, 'deploy_key_' + dep.project_name);
  const key = env.sshKey.endsWith('\n') ? env.sshKey : env.sshKey + '\n';
  fs.writeFileSync(keyFile, key, { mode: 0o600 });
  const sock = path.join(sshDir, `agent_${dep.project_name}.sock`);
  const agent = spawnSync('ssh-agent', ['-a', sock], { encoding: 'utf8' });
  if (agent.status !== 0 || !agent.stdout) fail(`ssh-agent failed for '${dep.name}': ${agent.stderr}`);
  const sockMatch = /SSH_AUTH_SOCK=([^;]+);/.exec(agent.stdout);
  const pidMatch = /SSH_AGENT_PID=([0-9]+);/.exec(agent.stdout);
  if (!sockMatch || !pidMatch) fail(`ssh-agent output not understood for '${dep.name}'`);
  dep.authSock = sockMatch[1];
  dep.agentPid = Number(pidMatch[1]);
  const add = spawnSync('ssh-add', ['-'], { input: key, env: Object.assign({}, process.env, { SSH_AUTH_SOCK: dep.authSock }), encoding: 'utf8' });
  if (add.status !== 0) fail(`ssh-add failed for '${dep.name}': ${add.stderr}`);
  const parsed = parseSshSpec(dep.context.host);
  const scan = spawnSync('ssh-keyscan', ['-p', parsed.port, '-H', parsed.host], { encoding: 'utf8', timeout: 60000 });
  if (scan.status !== 0 || !scan.stdout) fail(`ssh-keyscan failed for ${parsed.host}:${parsed.port}: ${scan.stderr}`);
  const khDir = path.join(os.homedir(), '.ssh');
  fs.mkdirSync(khDir, { mode: 0o700, recursive: true });
  const khFile = path.join(khDir, 'known_hosts');
  const existing = fs.existsSync(khFile) ? fs.readFileSync(khFile, 'utf8') : '';
  const newLines = scan.stdout.split('\n').map(l => l.trim()).filter(l => l && !existing.includes(l));
  if (newLines.length) {
    fs.appendFileSync(khFile, newLines.join('\n') + '\n');
    if (!state.knownHostsPath) state.knownHostsPath = khFile;
    state.knownHostAdded.push(...newLines);
  }
}

function sshChildEnv(dep) {
  const childEnv = Object.assign({}, process.env);
  if (dep.context.type === 'ssh') {
    childEnv.DOCKER_HOST = `ssh://${dep.context.host}`;
    childEnv.SSH_AUTH_SOCK = dep.authSock;
  }
  return childEnv;
}

function deploy(dep, env) {
  const childEnv = sshChildEnv(dep);
  console.log(`[deploy-engine] docker compose up for '${dep.name}' (project ${dep.project_name})`);
  dep.attemptedDeploy = true;
  const res = spawnSync('docker', ['compose', '-p', dep.project_name, '-f', dep.composeFile, 'up', '-d', '--build'], { cwd: env.workspace, stdio: 'inherit', env: childEnv });
  if (res.status !== 0 || res.error) fail(`docker compose up failed for '${dep.name}' (exit ${res.status})`);
  dep.reachedDeploy = true;
}

function httpAttempt(url) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok) => { if (!settled) { settled = true; resolve(ok); } };
    try {
      const req = http.get(url, { timeout: 5000 }, (res) => {
        const ok = res.statusCode >= 200 && res.statusCode < 300;
        res.resume();
        res.on('end', () => done(ok));
        res.on('error', () => done(false));
      });
      req.on('timeout', () => { req.destroy(); done(false); });
      req.on('error', () => done(false));
    } catch (e) { done(false); }
  });
}

async function healthcheck(dep) {
  const hc = dep.healthcheck;
  for (let attempt = 1; attempt <= hc.retries; attempt++) {
    const ok = await httpAttempt(hc.url);
    console.log(`[deploy-engine] healthcheck attempt ${attempt}/${hc.retries} for '${dep.name}': ${ok ? 'ok' : 'fail'}`);
    if (ok) { console.log('[deploy-engine] healthcheck passed'); return; }
    if (attempt < hc.retries) spawnSync('sleep', [String(hc.interval_seconds)], { stdio: 'ignore' });
  }
  fail(`Healthcheck failed for '${dep.name}' after ${hc.retries} attempts at ${hc.url}`);
}

function composeDown(dep, env) {
  const res = spawnSync('docker', ['compose', '-p', dep.project_name, '-f', dep.composeFile, 'down'], { cwd: env.workspace, stdio: 'inherit', env: sshChildEnv(dep) });
  console.log(`[deploy-engine] compose down for '${dep.name}' exited ${res.status}`);
}

function teardown(env, failed) {
  try {
    if (failed) {
      for (const dep of state.deployments) {
        if (dep.reachedDeploy || dep.attemptedDeploy) composeDown(dep, env);
      }
    }
  } catch (e) { emitError(`compose down during teardown failed: ${e}`); }
  for (const link of state.symlinks) {
    try { const st = fs.lstatSync(link); if (st.isSymbolicLink()) fs.unlinkSync(link); } catch (e) { }
  }
  for (const dep of state.deployments) {
    if (dep.agentPid) { try { process.kill(dep.agentPid, 'SIGTERM'); } catch (e) { } }
  }
  if (state.knownHostsPath && state.knownHostAdded.length) {
    try {
      const lines = fs.readFileSync(state.knownHostsPath, 'utf8').split('\n');
      const kept = lines.filter(l => l && !state.knownHostAdded.includes(l));
      if (kept.length) fs.writeFileSync(state.knownHostsPath, kept.join('\n') + '\n');
      else fs.unlinkSync(state.knownHostsPath);
    } catch (e) { }
  }
  if (state.tempBase) {
    try {
      for (const dep of state.deployments) {
        for (const envf of dep.env_files) {
          if (envf._tmpFile) { try { fs.unlinkSync(envf._tmpFile); } catch (e) { } }
        }
      }
      fs.rmSync(state.tempBase, { recursive: true, force: true });
    } catch (e) { }
  }
  const gout = process.env.GITHUB_OUTPUT;
  const lines = [];
  if (state.tempBase) lines.push(state.tempBase);
  for (const l of state.symlinks) lines.push(l);
  if (lines.length) {
    const block = `cleanup_paths<<EOF\n${lines.join('\n')}\nEOF\n`;
    if (gout) { try { fs.appendFileSync(gout, block); } catch (e) { console.log(block); } }
    else console.log(block);
  }
  console.log('[deploy-engine] teardown complete');
}

async function run() {
  const env = {
    workspace: process.env.GITHUB_WORKSPACE,
    manifest: process.env.INPUT_MANIFEST_PATH || 'deploy/deployments.json',
    sshKey: process.env.DEPLOY_SSH_KEY || '',
    runnerTemp: process.env.RUNNER_TEMP || os.tmpdir(),
    runId: process.env.GITHUB_RUN_ID || 'local-run',
    validateOnly: process.env.DEPLOY_ENGINE_VALIDATE_ONLY === '1'
  };
  if (!env.workspace) { console.error('::error::GITHUB_WORKSPACE is not set'); process.exit(1); }
  let failed = false;
  try {
    state.deployments = validate(env);
    console.log('[deploy-engine] Manifest validation passed');
    if (env.validateOnly) process.exit(0);
    state.tempBase = path.join(env.runnerTemp, 'deploy-engine', env.runId);
    materialize(env);
    console.log('[deploy-engine] env materialized');
    placeSymlinks(env);
    console.log('[deploy-engine] env present in checkout');
    for (const dep of state.deployments) {
      if (dep.context.type === 'ssh') setupSsh(dep, env);
      deploy(dep, env);
      await healthcheck(dep);
    }
    console.log('[deploy-engine] all deployments succeeded; stack left running');
  } catch (e) {
    failed = true;
    emitError(e instanceof EngineError ? e.message : `Internal error: ${e.stack}`);
  } finally {
    teardown(env, failed);
  }
  if (failed) process.exit(1);
}

run().catch(e => { console.error(`::error::Fatal: ${e.stack}`); process.exit(1); });
