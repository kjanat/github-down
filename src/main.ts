#!/usr/bin/env node
import { argv } from 'node:process';

import { githubUp } from '#github-up/cli';
import { helpFooter, wantsHelp } from '#github-up/cli/help-footer';
import { homepage } from '#pkg' with { type: 'json' };

import { createAdapter } from '@kjanat/dreamcli/runtime';

if (import.meta.main) {
	const adapter = createAdapter();
	const showFooter = wantsHelp(argv.slice(2));
	githubUp.run({
		adapter: {
			...adapter,
			// dreamcli has no help-footer hook, so detect a help invocation up front and append a pointer to the browser page once help has rendered.
			exit: (code) => {
				if (showFooter) adapter.stdout(helpFooter(homepage, adapter.isTTY));
				return adapter.exit(code);
			},
		},
	});
}
