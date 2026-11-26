const {once} = require('node:events');
const path = require('node:path');
const {existsSync} = require('node:fs');
const serve = require('./preview.cjs');

module.exports = async function startTestSite() {
  const root = path.resolve(__dirname, '../_site');
  if (!existsSync(path.join(root, 'index.html'))) throw Error('Build the site first with npm run build');
  const server = serve(0, {root});
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port + '/hoea_to_waka/';
  return {server, base, origin:new URL(base).origin};
};

module.exports.withTestSite = async function withTestSite(run) {
  if (process.env.SITE_BASE_URL) {
    const base = new URL(process.env.SITE_BASE_URL);
    return run({base:base.href, origin:base.origin});
  }
  const {server, base, origin} = await module.exports();
  try { return await run({base, origin}); }
  finally { server.close(); }
};
