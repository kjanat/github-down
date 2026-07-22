import { includesBeforeSeparator, osc8 } from '@kjanat/dreamcli';

/** Flags that make dreamcli render help instead of running a command. */
const HELP_FLAGS = new Set(['--help', '-h']);

/** Whether the given argv (without the node/script prefix) requests help. */
function wantsHelp(args: readonly string[]): boolean {
	return [...HELP_FLAGS].some((flag) => includesBeforeSeparator(args, flag));
}

/**
 * Trailing line appended under `--help`, pointing at the no-install web page.
 * DreamCLI only supports toggling its stock footer, so the binary prints this
 * custom pointer itself.
 *
 * In a TTY the URL becomes a clickable OSC 8 hyperlink (via dreamcli's own
 * {@link osc8}); otherwise it stays a bare URL so piped help (`--help | cat`)
 * carries no escape sequences.
 */
function helpFooter(siteUrl: string, hyperlink = false): string {
	const link = hyperlink ? osc8(siteUrl) : siteUrl;
	return `
No terminal? Watch the live status page: ${link}
`;
}

export { helpFooter, wantsHelp };
