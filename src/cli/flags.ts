import { flag } from '@kjanat/dreamcli';
import { cyan } from 'ansispeck/safe';

import { type ComponentKey, componentKeys, sources } from '#github-up/cli/model';
import { CHROME_PATH_ENV, GITHUB_STATUS_BASE } from '#github-up/lib/constants';

/** Overrides the base URL used to reach GitHub's Statuspage API. */
const githubStatusBaseFlag = flag
	.url()
	.alias('github-status-base', { hidden: true })
	.alias('base')
	.alias('b')
	.default(new URL(GITHUB_STATUS_BASE))
	.env('GITHUB_UP_GITHUB_STATUS_BASE')
	.describe('Override GitHub status page base URL');

/** Selects which data sources to query; defaults to all available sources.
 * Accepts comma-separated values and/or repeated flags. */
const sourceSelectionFlag = flag
	.array(flag.enum(sources))
	.separator(',')
	.unique()
	.alias('s')
	.default([...sources])
	.env('GITHUB_UP_SOURCE')
	.env('GITHUB_UP_SOURCES') // plural form for convenience
	.describe('Data source(s) to check');

/** Path to a Chrome/Chromium binary, overriding platform discovery. */
const chromeFlag = flag
	.string()
	.env(CHROME_PATH_ENV)
	.describe('Path to a Chrome/Chromium binary');

/** Restricts reported incidents/components to those naming the given GitHub
 * component(s). Accepts comma-separated values and/or repeated flags. */
const componentFlag = flag
	.array(flag.enum(componentKeys))
	.separator(',')
	.unique()
	.alias('c')
	.describe('Only report incidents/components mentioning these component(s)');

const shortcutForComponent = (component: string) => `Shortcut for ${cyan`--component ${component}`}`;

/** Per-component convenience flags, e.g. `--actions` is shorthand for `--component actions`. */
const componentConvenienceFlags = {
	actions: flag.boolean().describe(shortcutForComponent('actions')),
	api: flag.boolean().describe(shortcutForComponent('api')),
	codespaces: flag.boolean().describe(shortcutForComponent('codespaces')),
	copilot: flag.boolean().describe(shortcutForComponent('copilot')),
	git: flag.boolean().describe(shortcutForComponent('git')),
	issues: flag.boolean().alias('issue').describe(shortcutForComponent('issues')),
	packages: flag.boolean().describe(shortcutForComponent('packages')),
	pages: flag.boolean().describe(shortcutForComponent('pages')),
	pr: flag.boolean().alias('prs').describe(shortcutForComponent('pr')),
	webhooks: flag.boolean().describe(shortcutForComponent('webhooks')),
} as const satisfies Record<ComponentKey, unknown>;

/** Shape of the flag values used to determine which components were selected. */
type ComponentFlagValues =
	& { component: readonly ComponentKey[] }
	& Record<ComponentKey, boolean>;

/** Unions the `--component` lists with any enabled per-component convenience flags. */
function selectedComponents(flags: ComponentFlagValues): Set<ComponentKey> {
	const selected = new Set<ComponentKey>(flags.component);
	for (const key of componentKeys) {
		if (flags[key]) selected.add(key);
	}

	return selected;
}

export { chromeFlag, componentConvenienceFlags, componentFlag, githubStatusBaseFlag, selectedComponents, sourceSelectionFlag };
