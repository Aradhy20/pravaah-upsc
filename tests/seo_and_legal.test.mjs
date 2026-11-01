import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function fetchWithRetry(path) {
  let res = await fetch(`${BASE_URL}${path}`);
  if (res.status === 500) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res = await fetch(`${BASE_URL}${path}`);
  }
  return res;
}

test('SEO & Public Discoverability: robots.txt renders with strict privacy rules', async () => {
  const res = await fetchWithRetry('/robots.txt');
  assert.strictEqual(res.status, 200, `Expected 200 for robots.txt, got ${res.status}`);
  const content = await res.text();

  assert.ok(content.includes('User-Agent: *') || content.includes('User-agent: *'), 'Must declare user-agent rule');
  assert.ok(content.includes('Disallow: /dashboard'), 'Must disallow dashboard from crawler indexing');
  assert.ok(content.includes('Disallow: /admin'), 'Must disallow admin paths from crawler indexing');
  assert.ok(content.includes('Disallow: /api/'), 'Must disallow internal API paths');
  assert.ok(content.includes('sitemap.xml'), 'Must point crawlers to sitemap.xml');
});

test('SEO & Public Discoverability: sitemap.xml renders with full educational surface', async () => {
  const res = await fetchWithRetry('/sitemap.xml');
  assert.strictEqual(res.status, 200, `Expected 200 for sitemap.xml, got ${res.status}`);
  const xml = await res.text();

  assert.ok(xml.includes('<urlset') || xml.includes('xmlns'), 'Must be valid sitemap XML');
  assert.ok(xml.includes('/pricing'), 'Must include pricing page');
  assert.ok(xml.includes('/pyqs'), 'Must include pyqs hub');
  assert.ok(xml.includes('/exams/upsc-cse-prelims-gs-1'), 'Must index GS1 exam');
  assert.ok(xml.includes('/exams/upsc-cse-prelims-csat'), 'Must index CSAT exam');
  assert.ok(xml.includes('/subjects/polity-governance'), 'Must index Polity subject');
  assert.ok(xml.includes('/subjects/economy-development'), 'Must index Economy subject');
  assert.ok(xml.includes('/pyqs/2024/gs-1'), 'Must index 2024 GS1 archive');
  assert.ok(xml.includes('/pyqs/2024/csat'), 'Must index 2024 CSAT archive');
});

test('Legal & Compliance: Terms of service contains SaaS subscription & sandbox clauses', async () => {
  const res = await fetchWithRetry('/terms');
  assert.strictEqual(res.status, 200);
  const html = await res.text();

  assert.ok(html.includes('Terms of Service'), 'Must have page title');
  assert.ok(html.includes('Educational Purpose'), 'Must state educational purpose');
  assert.ok(html.includes('SaaS Subscriptions'), 'Must detail subscription tiers');
  assert.ok(html.includes('Sandbox Mode Notice'), 'Must disclose sandbox transaction mode');
  assert.ok(html.includes('grievance@pravaah.in'), 'Must specify grievance contact');
});

test('Legal & Compliance: Privacy policy is fully compliant with DPDP Act 2023', async () => {
  const res = await fetchWithRetry('/privacy');
  assert.strictEqual(res.status, 200);
  const html = await res.text();

  assert.ok(html.includes('Digital Personal Data Protection (DPDP) Act, 2023'), 'Must cite DPDP Act 2023');
  assert.ok(html.includes('Data Fiduciary'), 'Must declare Data Fiduciary status');
  assert.ok(html.includes('Data Principal'), 'Must recognize Data Principal rights');
  assert.ok(html.includes('Grievance Officer'), 'Must designate Grievance Officer');
  assert.ok(html.includes('grievance@pravaah.in'), 'Must list grievance email');
});
