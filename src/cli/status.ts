import type { Source, StatusRow } from '#github-down/cli/model';
import { EXIT_CODES } from '#github-down/lib/constants';
import { checkDownDetector } from '#github-down/lib/downdetector';
import { checkGitHub } from '#github-down/lib/github';
import { deriveConservativeIndicator, describeIndicator } from '#github-down/lib/severity';
import type { ComponentStatus } from '#github-down/lib/types';

function normalizeComponentStatus(value: string): ComponentStatus {
	if (
		value === 'operational'
		|| value === 'degraded_performance'
		|| value === 'partial_outage'
		|| value === 'major_outage'
		|| value === 'under_maintenance'
	) {
		return value;
	}

	return 'major_outage';
}

async function checkGitHubSource(
	githubStatusBase: string | URL,
): Promise<StatusRow> {
	const result = await checkGitHub(githubStatusBase);
	if (result.kind === 'unknown') {
		return {
			source: 'github',
			indicator: 'unavailable',
			summaryText: result.reason,
			incidents: null,
			affectedComponents: null,
		};
	}

	const reportedIndicator = result.summary.status.indicator;
	const indicator = deriveConservativeIndicator(
		reportedIndicator,
		result.summary.components,
	);
	const summaryText = indicator === reportedIndicator
		? result.summary.status.description
		: `${describeIndicator(indicator)} (reported ${String(reportedIndicator)})`;
	const affectedComponents = result.summary.components.filter(
		(component) => component.status !== 'operational',
	);

	return {
		source: 'github',
		indicator,
		summaryText,
		incidents: result.summary.incidents.length > 0
			? result.summary.incidents.map((incident) => ({
				name: incident.name,
				status: incident.status,
			}))
			: null,
		affectedComponents: affectedComponents.length > 0
			? affectedComponents.map((component) => ({
				name: component.name,
				status: normalizeComponentStatus(component.status),
			}))
			: null,
	};
}

async function checkDowndetectorSource(
	chromePath?: string,
): Promise<StatusRow> {
	const result = await checkDownDetector(chromePath);
	if (!result.ok) {
		return {
			source: 'downdetector',
			indicator: 'unavailable',
			summaryText: result.error,
			reportsOutage: false,
		};
	}

	if (result.down) {
		return {
			source: 'downdetector',
			indicator: 'major',
			summaryText: result.reason,
			reportsOutage: true,
		};
	}

	return {
		source: 'downdetector',
		indicator: result.note !== undefined ? 'minor' : 'none',
		summaryText: result.note ?? null,
		reportsOutage: false,
	};
}

async function checkSource(
	source: Source,
	githubStatusBase: string | URL,
	chromePath?: string,
): Promise<StatusRow> {
	switch (source) {
		case 'github':
			return checkGitHubSource(githubStatusBase);
		case 'downdetector':
			return checkDowndetectorSource(chromePath);
	}
}

async function checkSources(
	sources: readonly Source[],
	githubStatusBase: string | URL,
	chromePath?: string,
): Promise<readonly StatusRow[]> {
	return Promise.all(
		sources.map((source) => checkSource(source, githubStatusBase, chromePath)),
	);
}

function getExitCode(row: StatusRow): number {
	const code = EXIT_CODES[row.indicator];
	// An active incident is a failure even when the page indicator reads operational.
	if (row.source === 'github' && row.incidents && row.incidents.length > 0) {
		return Math.max(code, EXIT_CODES.minor);
	}

	return code;
}

function summarizeExitCode(rows: readonly StatusRow[]): number {
	const reachable = rows.filter((row) => row.indicator !== 'unavailable');
	// A source we couldn't reach is "unknown", not "down": its code only counts
	// when every source was unreachable, so a flaky Downdetector scrape doesn't
	// mask an otherwise-operational result.
	if (reachable.length === 0) {
		return rows.length === 0 ? EXIT_CODES.none : EXIT_CODES.unavailable;
	}

	return reachable.reduce<number>(
		(max, row) => Math.max(max, getExitCode(row)),
		EXIT_CODES.none,
	);
}

function sortRows(rows: readonly StatusRow[]): StatusRow[] {
	return [...rows].sort((left, right) => left.source.localeCompare(right.source));
}

export { checkDowndetectorSource, checkGitHubSource, checkSource, checkSources, getExitCode, sortRows, summarizeExitCode };
