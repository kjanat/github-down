#!/usr/bin/env node
import { githubUp } from '#github-up/cli';
import { helpFooter, wantsHelp } from '#github-up/cli/help-footer';
import { homepage } from '#pkg' with { type: 'json' };

import { resolveRenderContext } from '@kjanat/dreamcli';
import { createAdapter } from '@kjanat/dreamcli/runtime';

if (import.meta.main) {
	const adapter = createAdapter();
	const args = adapter.argv.slice(2);
	const showFooter = wantsHelp(args);
	const render = resolveRenderContext(args, {
		env: adapter.env,
		isTTY: adapter.isTTY,
	});
	githubUp.run({
		adapter: {
			...adapter,
			exit: (code) => {
				if (showFooter) {
					adapter.stdout(helpFooter(homepage, render.isHyperlinkSupported));
				}
				return adapter.exit(code);
			},
		},
	});
}
