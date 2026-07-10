import { describe, expect, test } from 'bun:test';
import { execPath } from 'node:process';

import { parseSourceList, selectedSources } from '#github-down/cli/flags';
import { sources } from '#github-down/cli/model';
import type { Source, StatusRow } from '#github-down/cli/model';
import { getExitCode, summarizeExitCode } from '#github-down/cli/status';
import { CHROME_PATH_ENV } from '#github-down/lib/constants';
import { findChrome } from '#github-down/lib/downdetector/chrome';

function githubRow(
	overrides: Partial<Extract<StatusRow, { source: 'github' }>> = {},
): StatusRow {
	return {
		source: 'github',
		indicator: 'major',
		summaryText: 'Partial System Outage',
		incidents: [
			{
				name: 'Actions is experiencing degraded availability',
				status: 'investigating',
			},
		],
		affectedComponents: [
			{
				name: 'Actions',
				status: 'degraded_performance',
			},
		],
		...overrides,
	};
}

describe(parseSourceList.name, () => {
	test('splits a comma-separated token', () => {
		expect(parseSourceList('github,downdetector')).toEqual([
			'github',
			'downdetector',
		]);
	});

	test('throws a clear error for an unknown source', () => {
		expect(() => parseSourceList('github,bogus')).toThrow(
			"Invalid value 'bogus' for flag --source. Allowed: github, downdetector",
		);
	});
});

describe(selectedSources.name, () => {
	test('supports the all-sources default', () => {
		expect(selectedSources([[...sources]])).toEqual([
			'github',
			'downdetector',
		]);
	});

	test('flattens per-occurrence lists', () => {
		const lists: readonly (readonly Source[])[] = [
			['github'],
			['downdetector'],
		];
		expect(selectedSources(lists)).toEqual(['github', 'downdetector']);
	});
});

describe('getExitCode', () => {
	test('fails when an active incident is present under an operational indicator', () => {
		expect(getExitCode(githubRow({ indicator: 'none' }))).toBe(1);
	});

	test('is zero when operational with no incidents', () => {
		expect(
			getExitCode(githubRow({ indicator: 'none', incidents: null })),
		).toBe(0);
	});

	test('reflects the indicator when it is more severe than an incident', () => {
		expect(getExitCode(githubRow({ indicator: 'major' }))).toBe(2);
	});

	test('reports unavailable downdetector with its dedicated code', () => {
		expect(
			getExitCode({
				source: 'downdetector',
				indicator: 'unavailable',
				summaryText: 'boom',
				reportsOutage: false,
			}),
		).toBe(21);
	});
});

describe(summarizeExitCode.name, () => {
	const unreachableDowndetector: StatusRow = {
		source: 'downdetector',
		indicator: 'unavailable',
		summaryText: 'CF challenge not cleared in time',
		reportsOutage: false,
	};

	test('ignores an unreachable source when another was readable', () => {
		// GitHub operational with no incidents -> 0, despite Downdetector
		// being unavailable (a flaky scrape must not force 21).
		expect(
			summarizeExitCode([
				githubRow({ indicator: 'none', incidents: null }),
				unreachableDowndetector,
			]),
		).toBe(0);
	});

	test('keeps a real outage when another source is unreachable', () => {
		expect(
			summarizeExitCode([
				githubRow({ indicator: 'major' }),
				unreachableDowndetector,
			]),
		).toBe(2);
	});

	test('surfaces 21 only when every source is unreachable', () => {
		expect(
			summarizeExitCode([
				githubRow({
					indicator: 'unavailable',
					incidents: null,
					affectedComponents: null,
				}),
				unreachableDowndetector,
			]),
		).toBe(21);
	});

	test('is zero for no rows', () => {
		expect(summarizeExitCode([])).toBe(0);
	});
});

describe('findChrome override', () => {
	test('uses an explicit path that exists', () => {
		expect(findChrome(execPath)).toBe(execPath);
	});

	test('returns null for an explicit path that does not exist', () => {
		expect(findChrome('/no/such/chrome-binary')).toBeNull();
	});

	test('honors the GITHUB_DOWN_CHROME environment variable', () => {
		const previous = process.env[CHROME_PATH_ENV];
		process.env[CHROME_PATH_ENV] = execPath;
		try {
			expect(findChrome()).toBe(execPath);
		} finally {
			if (previous === undefined) delete process.env[CHROME_PATH_ENV];
			else process.env[CHROME_PATH_ENV] = previous;
		}
	});
});
