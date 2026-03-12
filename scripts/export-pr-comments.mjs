#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const DEFAULT_OUTPUT = 'reports/pr-comments-report.md';
const DEFAULT_CONTEXT_LINES = 4;
const GH_MAX_BUFFER_BYTES = 50 * 1024 * 1024;
const DISABLED_FLAG_VALUES = new Set(['0', 'false', 'no', 'off']);

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const part = argv[index];

    if (part === '--help' || part === '-h') {
      args.help = true;
      continue;
    }

    if (!part.startsWith('--')) {
      if (!args._) {
        args._ = [];
      }
      args._.push(part);
      continue;
    }

    const [rawKey, inlineValue] = part.split('=');
    const key = rawKey.slice(2);

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const nextPart = argv[index + 1];
    if (nextPart && !nextPart.startsWith('--')) {
      args[key] = nextPart;
      index += 1;
      continue;
    }

    args[key] = true;
  }

  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/export-pr-comments.mjs [--pr <number> | --head <branch>] [options]

Options:
  --repo <owner/name>       GitHub repository (default: parsed from origin remote)
  --pr <number>             Pull request number
  --head <branch>           Head branch name (example: feature/device-onboarding)
  --output <file>           Markdown output path (default: ${DEFAULT_OUTPUT})
  --context-lines <n>       Number of lines around inline comment reference (default: ${DEFAULT_CONTEXT_LINES})
  --token <token>           GitHub token override for gh calls (default: gh auth / GH_TOKEN / GITHUB_TOKEN)
  --include-copilot         Keep Copilot-authored comments (default: filtered out)
  --exclude-authors <list>  Extra comma-separated GitHub logins to exclude
  --include-empty-reviews   Include review events with empty body (APPROVED without text, etc.)
  --help                    Show this help

Examples:
  node scripts/export-pr-comments.mjs --head feature/device-onboarding
  node scripts/export-pr-comments.mjs --pr 123 --repo owner/repo --output reports/pr-123.md
`);
}

function parseRepoFromRemote(remoteUrl) {
  const sshMatch = remoteUrl.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  const httpsMatch = remoteUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i,
  );
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  throw new Error(
    `Could not parse GitHub owner/repo from remote URL: ${remoteUrl}. Pass --repo owner/name.`,
  );
}

function parseRepoInput(repoInput) {
  const [owner, repo] = String(repoInput).split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid --repo value "${repoInput}". Expected owner/name.`);
  }
  return { owner, repo };
}

function encodePathSegments(filePath) {
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function extensionToLanguage(filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  const languageByExt = {
    cjs: 'javascript',
    css: 'css',
    html: 'html',
    js: 'javascript',
    json: 'json',
    jsx: 'jsx',
    md: 'markdown',
    mjs: 'javascript',
    scss: 'scss',
    ts: 'typescript',
    tsx: 'tsx',
    yaml: 'yaml',
    yml: 'yaml',
  };

  return languageByExt[extension] ?? '';
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function isFlagEnabled(value) {
  if (value === undefined) {
    return false;
  }

  if (value === true) {
    return true;
  }

  if (typeof value === 'string') {
    return !DISABLED_FLAG_VALUES.has(value.trim().toLowerCase());
  }

  return Boolean(value);
}

function normalizeAuthor(author) {
  return String(author ?? '').trim().toLowerCase();
}

function parseCsvList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isCopilotAuthor(author) {
  return normalizeAuthor(author).includes('copilot');
}

function createEventFilter({ includeCopilot, excludeAuthorsInput }) {
  const excludedAuthors = new Set(
    parseCsvList(excludeAuthorsInput).map((author) => normalizeAuthor(author)),
  );

  function reasonForAuthor(author) {
    const normalized = normalizeAuthor(author);
    if (!normalized) {
      return null;
    }

    if (!includeCopilot && isCopilotAuthor(normalized)) {
      return 'copilot';
    }

    if (excludedAuthors.has(normalized)) {
      return 'exclude-authors';
    }

    return null;
  }

  return {
    includeCopilot,
    excludedAuthors,
    reasonForAuthor,
  };
}

function formatIso(value) {
  if (!value) {
    return 'unknown';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString();
}

function toQuote(text) {
  if (!text || !text.trim()) {
    return '> (empty)';
  }

  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function computeLineWindow(comment, contextLines) {
  const lineCandidates = [
    comment.start_line,
    comment.original_start_line,
    comment.line,
    comment.original_line,
  ]
    .map((value) => (Number.isFinite(value) ? value : null))
    .filter((value) => value !== null);

  if (lineCandidates.length === 0) {
    return null;
  }

  const first = Math.min(...lineCandidates);
  const last = Math.max(...lineCandidates);

  return {
    start: Math.max(1, first - contextLines),
    end: Math.max(last, last + contextLines),
    focusStart: first,
    focusEnd: last,
  };
}

async function runGhJson(args, ghEnv = {}) {
  try {
    const { stdout } = await execFileAsync('gh', args, {
      env: {
        ...process.env,
        ...ghEnv,
      },
      maxBuffer: GH_MAX_BUFFER_BYTES,
    });

    const trimmed = stdout.trim();
    if (!trimmed) {
      return null;
    }

    return JSON.parse(trimmed);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error('`gh` CLI not found. Install GitHub CLI and run `gh auth login`.');
    }

    const stderr = String(error?.stderr ?? '').trim();
    const stdout = String(error?.stdout ?? '').trim();
    const details = [stderr, stdout].filter(Boolean).join('\n');
    throw new Error(
      `Failed gh command: gh ${args.join(' ')}${details ? `\n${details}` : ''}`,
    );
  }
}

async function ghApi(endpoint, { paginate = false, slurp = false, ghEnv = {} } = {}) {
  const args = ['api'];
  if (paginate) {
    args.push('--paginate');
  }
  if (slurp) {
    args.push('--slurp');
  }
  args.push(endpoint);
  return runGhJson(args, ghEnv);
}

async function ghApiPaginatedArray(endpoint, ghEnv = {}) {
  const data = await ghApi(endpoint, { paginate: true, slurp: true, ghEnv });

  if (!data) {
    return [];
  }

  if (Array.isArray(data) && data.every((page) => Array.isArray(page))) {
    return data.flat();
  }

  if (Array.isArray(data)) {
    return data;
  }

  throw new Error(`Expected array response for endpoint "${endpoint}".`);
}

async function resolveRepo(inputRepo) {
  if (inputRepo) {
    return parseRepoInput(inputRepo);
  }

  const { stdout } = await execFileAsync('git', ['remote', 'get-url', 'origin']);
  return parseRepoFromRemote(stdout.trim());
}

async function resolvePr({ owner, repo, prNumber, headBranch, ghEnv }) {
  if (prNumber) {
    return ghApi(`repos/${owner}/${repo}/pulls/${encodeURIComponent(prNumber)}`, {
      ghEnv,
    });
  }

  if (!headBranch) {
    throw new Error('Provide either --pr <number> or --head <branch>.');
  }

  const params = new URLSearchParams({
    state: 'all',
    head: `${owner}:${headBranch}`,
    per_page: '100',
  });

  const data = await ghApi(`repos/${owner}/${repo}/pulls?${params.toString()}`, {
    ghEnv,
  });
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `No pull request found for branch "${headBranch}" in ${owner}/${repo}. ` +
        'Pass --pr <number> if needed.',
    );
  }

  if (data.length === 1) {
    return data[0];
  }

  const sorted = [...data].sort(
    (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
  return sorted[0];
}

async function fetchFileContentAtRef({
  owner,
  repo,
  filePath,
  ref,
  ghEnv,
  cache,
}) {
  const key = `${ref}::${filePath}`;
  if (cache.has(key)) {
    return cache.get(key);
  }

  const encodedPath = encodePathSegments(filePath);
  const endpoint = `repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;

  try {
    const data = await ghApi(endpoint, { ghEnv });
    if (!data || typeof data.content !== 'string' || data.encoding !== 'base64') {
      cache.set(key, null);
      return null;
    }
    const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
    cache.set(key, decoded);
    return decoded;
  } catch {
    cache.set(key, null);
    return null;
  }
}

function extractCodeWindow(fileContent, window) {
  const lines = fileContent.replace(/\r\n/g, '\n').split('\n');
  const start = Math.max(1, window.start);
  const end = Math.min(lines.length, window.end);
  const code = lines.slice(start - 1, end).join('\n');

  return {
    code,
    start,
    end,
  };
}

function mapIssueComment(comment) {
  return {
    id: `issue-${comment.id}`,
    type: 'Issue comment',
    createdAt: comment.created_at,
    author: comment.user?.login ?? 'unknown',
    body: comment.body ?? '',
    url: comment.html_url,
    path: null,
  };
}

function mapReviewComment(comment) {
  return {
    id: `review-comment-${comment.id}`,
    type: 'Inline review comment',
    createdAt: comment.created_at,
    author: comment.user?.login ?? 'unknown',
    body: comment.body ?? '',
    url: comment.html_url,
    path: comment.path ?? null,
    commitId: comment.commit_id ?? comment.original_commit_id ?? null,
    line: comment.line ?? comment.original_line ?? null,
    startLine: comment.start_line ?? comment.original_start_line ?? null,
    diffHunk: comment.diff_hunk ?? null,
    raw: comment,
  };
}

function mapReview(review) {
  return {
    id: `review-${review.id}`,
    type: `Review (${String(review.state || 'unknown').toLowerCase()})`,
    createdAt: review.submitted_at ?? review.created_at,
    author: review.user?.login ?? 'unknown',
    body: review.body ?? '',
    url: review.html_url,
    path: null,
    state: review.state ?? null,
  };
}

function summarize(commentEvents) {
  const byType = new Map();
  const byAuthor = new Map();

  for (const event of commentEvents) {
    byType.set(event.type, (byType.get(event.type) ?? 0) + 1);
    byAuthor.set(event.author, (byAuthor.get(event.author) ?? 0) + 1);
  }

  const typeRows = [...byType.entries()].sort((left, right) => right[1] - left[1]);
  const authorRows = [...byAuthor.entries()].sort((left, right) => right[1] - left[1]);

  return { typeRows, authorRows };
}

function summarizeExcludedEvents(excludedEvents) {
  const byReason = new Map();
  const byAuthor = new Map();

  for (const event of excludedEvents) {
    const reason = event.excludedReason || 'unknown';
    byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
    byAuthor.set(event.author, (byAuthor.get(event.author) ?? 0) + 1);
  }

  const reasonRows = [...byReason.entries()].sort((left, right) => right[1] - left[1]);
  const authorRows = [...byAuthor.entries()].sort((left, right) => right[1] - left[1]);

  return {
    count: excludedEvents.length,
    reasonRows,
    authorRows,
  };
}

async function enrichWithCode({
  events,
  owner,
  repo,
  headSha,
  ghEnv,
  contextLines,
}) {
  const cache = new Map();
  const enriched = [];

  for (const event of events) {
    if (event.type !== 'Inline review comment') {
      enriched.push(event);
      continue;
    }

    const referenceWindow = computeLineWindow(event.raw, contextLines);
    if (!event.path || !referenceWindow) {
      enriched.push(event);
      continue;
    }

    const ref = event.commitId || headSha;
    const fileContent = await fetchFileContentAtRef({
      owner,
      repo,
      filePath: event.path,
      ref,
      ghEnv,
      cache,
    });

    if (!fileContent) {
      enriched.push({
        ...event,
        codeReference: event.diffHunk
          ? {
              kind: 'diff',
              language: 'diff',
              snippet: event.diffHunk,
            }
          : null,
      });
      continue;
    }

    const codeWindow = extractCodeWindow(fileContent, referenceWindow);
    enriched.push({
      ...event,
      codeReference: {
        kind: 'file',
        language: extensionToLanguage(event.path),
        snippet: codeWindow.code,
        start: codeWindow.start,
        end: codeWindow.end,
        focusStart: referenceWindow.focusStart,
        focusEnd: referenceWindow.focusEnd,
        ref,
      },
    });
  }

  return enriched;
}

function renderMarkdown({
  owner,
  repo,
  pr,
  events,
  summary,
  filterConfig,
  filterSummary,
}) {
  const lines = [];

  lines.push(`# PR #${pr.number} Comments + Referenced Code`);
  lines.push('');
  lines.push(`- Repository: \`${owner}/${repo}\``);
  lines.push(`- PR: [#${pr.number} ${pr.title}](${pr.html_url})`);
  lines.push(`- Base/Head: \`${pr.base?.ref ?? 'unknown'} <- ${pr.head?.ref ?? 'unknown'}\``);
  lines.push(`- Generated at: \`${new Date().toISOString()}\``);
  lines.push(`- Total events: \`${events.length}\``);
  lines.push(`- Copilot filter: \`${filterConfig.includeCopilot ? 'off' : 'on'}\``);
  if (filterConfig.excludedAuthors.size > 0) {
    lines.push(`- Extra excluded authors: \`${[...filterConfig.excludedAuthors].join(', ')}\``);
  }
  if (filterSummary.count > 0) {
    lines.push(`- Filtered out events: \`${filterSummary.count}\``);
  }
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push('### By Type');
  lines.push('');
  if (summary.typeRows.length === 0) {
    lines.push('- No comments found.');
  } else {
    for (const [type, count] of summary.typeRows) {
      lines.push(`- ${type}: ${count}`);
    }
  }
  lines.push('');

  lines.push('### By Author');
  lines.push('');
  if (summary.authorRows.length === 0) {
    lines.push('- No comments found.');
  } else {
    for (const [author, count] of summary.authorRows) {
      lines.push(`- ${author}: ${count}`);
    }
  }
  lines.push('');

  if (filterSummary.count > 0) {
    lines.push('### Filtered Out');
    lines.push('');
    for (const [reason, count] of filterSummary.reasonRows) {
      lines.push(`- ${reason}: ${count}`);
    }
    lines.push('');
    lines.push('Top excluded authors:');
    for (const [author, count] of filterSummary.authorRows.slice(0, 10)) {
      lines.push(`- ${author}: ${count}`);
    }
    lines.push('');
  }

  lines.push('## Timeline');
  lines.push('');

  if (events.length === 0) {
    lines.push('No comments or reviews found for this PR.');
    lines.push('');
    return lines.join('\n');
  }

  events.forEach((event, index) => {
    lines.push(`### ${index + 1}. ${event.type}`);
    lines.push('');
    lines.push(`- Author: \`${event.author}\``);
    lines.push(`- Created: \`${formatIso(event.createdAt)}\``);
    lines.push(`- URL: ${event.url}`);

    if (event.path) {
      lines.push(`- File: \`${event.path}\``);
      if (Number.isFinite(event.startLine) && Number.isFinite(event.line)) {
        lines.push(`- Line range: \`${event.startLine}-${event.line}\``);
      } else if (Number.isFinite(event.line)) {
        lines.push(`- Line: \`${event.line}\``);
      }
    }

    if (event.state) {
      lines.push(`- State: \`${event.state}\``);
    }

    lines.push('');
    lines.push('**Comment**');
    lines.push('');
    lines.push(toQuote(event.body));
    lines.push('');

    if (event.codeReference?.kind === 'file') {
      const language = event.codeReference.language;
      lines.push(
        `**Referenced code** (\`${event.path}:${event.codeReference.start}-${event.codeReference.end}\`, ref \`${event.codeReference.ref?.slice(0, 12)}\`)`,
      );
      lines.push('');
      lines.push(`\`\`\`${language}`);
      lines.push(event.codeReference.snippet || '');
      lines.push('```');
      lines.push('');
      lines.push(
        `Focus line(s): \`${event.codeReference.focusStart}-${event.codeReference.focusEnd}\``,
      );
      lines.push('');
    } else if (event.codeReference?.kind === 'diff') {
      lines.push('**Referenced code (diff hunk from GitHub)**');
      lines.push('');
      lines.push('```diff');
      lines.push(event.codeReference.snippet || '');
      lines.push('```');
      lines.push('');
    }
  });

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printUsage();
    return;
  }

  const token = args.token || '';
  const ghEnv = token ? { GH_TOKEN: token, GITHUB_TOKEN: token } : {};
  const contextLines = Math.max(
    0,
    toNumber(args['context-lines'], DEFAULT_CONTEXT_LINES),
  );
  const outputPath = args.output || DEFAULT_OUTPUT;
  const prNumber = args.pr;
  const headBranch = args.head;
  const includeCopilot = isFlagEnabled(args['include-copilot']);
  const includeEmptyReviews = isFlagEnabled(args['include-empty-reviews']);
  const filterConfig = createEventFilter({
    includeCopilot,
    excludeAuthorsInput: args['exclude-authors'],
  });

  const { owner, repo } = await resolveRepo(args.repo);
  const pr = await resolvePr({
    owner,
    repo,
    prNumber,
    headBranch,
    ghEnv,
  });

  const [issueComments, reviewComments, reviews] = await Promise.all([
    ghApiPaginatedArray(
      `repos/${owner}/${repo}/issues/${pr.number}/comments?per_page=100`,
      ghEnv,
    ),
    ghApiPaginatedArray(
      `repos/${owner}/${repo}/pulls/${pr.number}/comments?per_page=100`,
      ghEnv,
    ),
    ghApiPaginatedArray(
      `repos/${owner}/${repo}/pulls/${pr.number}/reviews?per_page=100`,
      ghEnv,
    ),
  ]);

  const rawEvents = [
    ...issueComments.map(mapIssueComment),
    ...reviewComments.map(mapReviewComment),
    ...reviews
      .map(mapReview)
      .filter((review) => includeEmptyReviews || Boolean(review.body && review.body.trim())),
  ];

  const includedEvents = [];
  const excludedEvents = [];

  for (const event of rawEvents) {
    const excludedReason = filterConfig.reasonForAuthor(event.author);
    if (excludedReason) {
      excludedEvents.push({
        ...event,
        excludedReason,
      });
      continue;
    }

    includedEvents.push(event);
  }

  const events = includedEvents.sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  const enrichedEvents = await enrichWithCode({
    events,
    owner,
    repo,
    headSha: pr.head?.sha ?? '',
    ghEnv,
    contextLines,
  });
  const summary = summarize(enrichedEvents);
  const filterSummary = summarizeExcludedEvents(excludedEvents);
  const markdown = renderMarkdown({
    owner,
    repo,
    pr,
    events: enrichedEvents,
    summary,
    filterConfig,
    filterSummary,
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, markdown, 'utf-8');

  console.log(`Wrote ${enrichedEvents.length} events to ${outputPath}`);
  if (filterSummary.count > 0) {
    const reasons = filterSummary.reasonRows
      .map(([reason, count]) => `${reason}: ${count}`)
      .join(', ');
    console.log(`Filtered out ${filterSummary.count} events (${reasons})`);
  }
  console.log(`PR: #${pr.number} ${pr.title}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
