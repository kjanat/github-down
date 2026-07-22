import { sourceLabels } from '#github-up/cli/model';
import type { StatusOutputRow, StatusRow } from '#github-up/cli/model';
import { DOWNDETECTOR_URL, GITHUB_STATUS_BASE } from '#github-up/lib/constants';
import type { IncidentImpactValue } from '#github-up/types';
import pkg from '#pkg' with { type: 'json' };

import type { Colors, Out } from '@kjanat/dreamcli';

type ColorFn = (text: string) => string;

function indicatorColors(c: Colors): Record<IncidentImpactValue, ColorFn> {
	return {
		none: c.green,
		minor: c.yellow,
		major: c.red,
		critical: c.red,
	};
}

type RenderStatusRowOptions = Readonly<{
	leadingBlank?: boolean;
}>;

function statusColor(row: StatusRow, c: Colors): ColorFn {
	if (row.indicator === 'unavailable') return c.dim;
	return indicatorColors(c)[row.indicator];
}

function urlFor(row: StatusRow): string {
	return row.source === 'github' ? GITHUB_STATUS_BASE : DOWNDETECTOR_URL;
}

function formatList(
	lines: string[],
	label: string,
	items: readonly string[],
): void {
	if (items.length === 0) return;

	lines.push(`  ${label}:`);
	for (const item of items) {
		lines.push(`    - ${item}`);
	}
}

function formatRow(row: StatusRow, c: Colors, hyperlinks: boolean): string {
	const color = statusColor(row, c);
	const label = c.underline(c.bold(color(sourceLabels[row.source])));
	const header = hyperlinks ? c.link(urlFor(row), label) : label;
	const lines: string[] = [header];

	if (row.indicator === 'unavailable') {
		const reason = row.summaryText ?? 'unknown error';
		lines.push(`  ${color(`Unavailable: ${reason}`)}`);
		return lines.join('\n');
	}

	if (row.source === 'downdetector') {
		const summary = row.summaryText ?? 'No user-reported issues';
		lines.push(`  ${color(summary)}`);
		return lines.join('\n');
	}

	const summary = row.summaryText ?? 'All systems operational';
	lines.push(`  ${color(summary)}`);

	const incidents = row.incidents?.map((incident) => `${incident.name} (${incident.status})`)
		?? [];
	formatList(
		lines,
		incidents.length === 1 ? 'Active incident' : 'Active incidents',
		incidents,
	);
	formatList(
		lines,
		'Affected components',
		row.affectedComponents?.map((component) => component.name) ?? [],
	);

	return lines.join('\n');
}

function toOutputRow(row: StatusRow): StatusOutputRow {
	if (row.source === 'downdetector') {
		const status = row.indicator === 'unavailable'
			? 'unavailable'
			: row.reportsOutage
			? 'down'
			: 'up';
		return {
			source: 'downdetector',
			status,
			details: row.summaryText,
		};
	}

	return {
		source: 'github',
		status: row.indicator === 'none' ? 'up' : row.indicator,
		details: row.summaryText,
		incidents: row.incidents,
		affected: row.affectedComponents,
	};
}

function toOutputRows(rows: readonly StatusRow[]): StatusOutputRow[] {
	return rows.map((row) => toOutputRow(row));
}

function renderStatusRows(rows: readonly StatusRow[], out: Out): void {
	if (out.jsonMode) {
		out.json(toOutputRows(rows));
		return;
	}

	if (!out.isTTY) {
		out.info(JSON.stringify(toOutputRows(rows)));
		return;
	}

	out.info(
		rows
			.map((row) => formatRow(row, out.color, out.isHyperlinkSupported))
			.join('\n\n'),
	);
}

/**
 * Renders a single styled status row, used by the interactive path to print
 * each source the moment it resolves. Only invoked in TTY, non-JSON mode, so
 * styling always tracks {@linkcode Out.isTTY}.
 */
function renderStatusRow(
	row: StatusRow,
	out: Out,
	options: RenderStatusRowOptions = {},
): void {
	const prefix = options.leadingBlank === true ? '\n' : '';
	out.info(`${prefix}${formatRow(row, out.color, out.isHyperlinkSupported)}`);
}

/**
 * Trailing pointer to the auto-polling web page, printed under human status
 * output. Dimmed and OSC 8-linked so it stays unobtrusive yet clickable, and
 * suppressed in JSON/non-TTY so machine-readable output is left untouched.
 */
function renderPageFooter(out: Out): void {
	if (out.jsonMode || !out.isTTY) return;

	const label = out.color.underline(pkg.homepage);
	const link = out.isHyperlinkSupported
		? out.color.link(pkg.homepage, label)
		: label;
	out.info(`\n${out.color.dim(`Watch the live status page: ${link}`)}`);
}

export { renderPageFooter, renderStatusRow, renderStatusRows, toOutputRows };
