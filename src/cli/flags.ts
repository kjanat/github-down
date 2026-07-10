import { flag, ParseError } from '@kjanat/dreamcli';

import { type Source, sources } from '#github-down/cli/model';
import { CHROME_PATH_ENV, GITHUB_STATUS_BASE } from '#github-down/lib/constants';

/** Builds a flag parser that splits one comma-separated token into validated
 * enum members, so `--flag a,b` works alongside repeated `--flag a --flag b`.
 * Thrown ParseErrors are surfaced verbatim by dreamcli's flag parser, matching
 * its built-in enum error format. */
function csvEnumParser<T extends string>(
	allowed: readonly T[],
	flagName: string,
): (raw: unknown) => readonly T[] {
	return (raw: unknown): readonly T[] => {
		const result: T[] = [];
		for (const token of String(raw).split(',')) {
			const name = token.trim();
			if (name.length === 0) continue;
			// `find` yields the typed member (or undefined) without a cast.
			const match = allowed.find((value) => value === name);
			if (match === undefined) {
				throw new ParseError(
					`Invalid value '${name}' for flag --${flagName}. Allowed: ${
						allowed.join(
							', ',
						)
					}`,
					{
						code: 'INVALID_VALUE',
						details: {
							flag: flagName,
							input: `--${flagName}`,
							value: name,
							allowed,
						},
					},
				);
			}
			result.push(match);
		}

		return result;
	};
}

/** Parses one `--source` token into the sources it names (comma-separated). */
const parseSourceList = csvEnumParser(sources, 'source');

/** Suppresses all output; the process exit code conveys the status instead. */
const quietFlag = flag.boolean().alias('q').describe('Silent; exit code only');

/** Overrides the base URL used to reach GitHub's Statuspage API. */
const githubStatusBaseFlag = flag
	.custom((raw) => new URL(String(raw)))
	.alias('github-status-base', { hidden: true })
	.alias('base')
	.alias('b')
	.default(new URL(GITHUB_STATUS_BASE))
	.env('GITHUB_DOWN_GITHUB_STATUS_BASE')
	.describe('Override GitHub status page base URL');

/** Selects which data sources to query; defaults to all available sources.
 * Accepts comma-separated values and/or repeated flags. */
const sourceSelectionFlag = flag
	.array(flag.custom(parseSourceList))
	.alias('s')
	.default([[...sources]])
	.env('GITHUB_DOWN_SOURCE')
	.env('GITHUB_DOWN_SOURCES') // plural form for convenience
	.describe('Data source(s) to check');

/** Path to a Chrome/Chromium binary, overriding platform discovery. */
const chromeFlag = flag
	.string()
	.env(CHROME_PATH_ENV)
	.describe('Path to a Chrome/Chromium binary');

/** Flattens the per-occurrence `--source` lists into the sources to query. */
function selectedSources(
	source: readonly (readonly Source[])[],
): readonly Source[] {
	return source.flat();
}

export { chromeFlag, githubStatusBaseFlag, parseSourceList, quietFlag, selectedSources, sourceSelectionFlag };
