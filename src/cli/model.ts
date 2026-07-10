import type { ComponentStatus, IncidentStatusValue, Indicator } from '#github-down/lib/types';

const sources = ['github', 'downdetector'] as const;

type Source = (typeof sources)[number];

const sourceLabels = {
	github: 'GitHub',
	downdetector: 'Downdetector',
} as const satisfies Record<Source, string>;

type IncidentSummary = Readonly<{
	name: string;
	status: IncidentStatusValue;
}>;

type AffectedComponent = Readonly<{
	name: string;
	status: ComponentStatus;
}>;

type GitHubStatusRow = Readonly<{
	source: 'github';
	indicator: Indicator;
	summaryText: string | null;
	incidents: readonly IncidentSummary[] | null;
	affectedComponents: readonly AffectedComponent[] | null;
}>;

type DowndetectorStatusRow = Readonly<{
	source: 'downdetector';
	indicator: Extract<Indicator, 'none' | 'minor' | 'major' | 'unavailable'>;
	summaryText: string | null;
	reportsOutage: boolean;
}>;

type StatusRow = GitHubStatusRow | DowndetectorStatusRow;

type GitHubOutputStatus = Exclude<Indicator, 'none'> | 'up';
type DowndetectorOutputStatus = 'up' | 'down' | 'unavailable';

type GitHubOutputRow = Readonly<{
	source: 'github';
	status: GitHubOutputStatus;
	details: string | null;
	incidents: readonly IncidentSummary[] | null;
	affected: readonly AffectedComponent[] | null;
}>;

type DowndetectorOutputRow = Readonly<{
	source: 'downdetector';
	status: DowndetectorOutputStatus;
	details: string | null;
}>;

type StatusOutputRow = GitHubOutputRow | DowndetectorOutputRow;

export { sourceLabels, sources };
export type { DowndetectorStatusRow, GitHubStatusRow, Source, StatusOutputRow, StatusRow };
