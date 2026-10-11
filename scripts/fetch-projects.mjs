// Refreshes src/data/projects.json with every public, non-fork repo owned by
// OWNER that publishes a GitHub Pages site. Runs before each build (prebuild)
// and nightly in CI. If GitHub is unreachable, the committed file is kept so
// the build never fails because of the API.
import { readFile, writeFile } from 'node:fs/promises';

const OWNER = 'dhanesh';
const SITE_REPO = `${OWNER}.github.io`;
const OUT = new URL('../src/data/projects.json', import.meta.url);
const OVERRIDES = new URL('../src/data/project-overrides.json', import.meta.url);

// Category rule: an override wins; otherwise a guide/handbook topic or a
// docs-only language makes a repo a guide, and everything else is software.
const GUIDE_TOPICS = new Set(['guide', 'guides', 'handbook', 'field-guide']);
const GUIDE_LANGUAGES = new Set(['MDX', 'Markdown']);

function categorize(repo, override) {
  if (override.category) return override.category;
  if (repo.topics?.some((t) => GUIDE_TOPICS.has(t))) return 'guides';
  if (GUIDE_LANGUAGES.has(repo.language)) return 'guides';
  return 'software';
}

function titleFromName(name) {
  return name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function fetchRepos() {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const repos = [];
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/users/${OWNER}/repos?type=owner&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

async function main() {
  const overrides = JSON.parse(await readFile(OVERRIDES, 'utf8'));
  let repos;
  try {
    repos = await fetchRepos();
  } catch (err) {
    console.warn(`fetch-projects: ${err.message}; keeping existing projects.json`);
    return;
  }

  const projects = repos
    .filter((r) => r.has_pages && !r.fork && !r.archived && !r.private && r.name !== SITE_REPO)
    .map((r) => {
      const o = overrides[r.name] ?? {};
      if (o.hidden) return null;
      return {
        name: r.name,
        title: o.title ?? titleFromName(r.name),
        description: o.description ?? r.description ?? '',
        url: o.url ?? (r.homepage || `https://${OWNER}.github.io/${r.name}/`),
        repo: r.html_url,
        category: categorize(r, o),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));

  await writeFile(OUT, JSON.stringify(projects, null, 2) + '\n');
  console.log(`fetch-projects: wrote ${projects.length} projects`);
}

await main();
