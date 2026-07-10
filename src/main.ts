#!/usr/bin/env node

import { githubDown } from '#github-down/cli';
import { helpFooter, wantsHelp } from '#github-down/cli/help-footer';
import pkg from '#pkg' with { type: 'json' };
import { createNodeAdapter } from '@kjanat/dreamcli/runtime';
import { argv, stdout } from 'node:process';

if (import.meta.main) {
	const adapter = createNodeAdapter();
	// dreamcli has no help-footer hook, so detect a help invocation up front and
	// append a pointer to the browser page once help has rendered.
	const showFooter = wantsHelp(argv.slice(2));
	githubDown.run({
		help: { width: stdout.columns },
		adapter: {
			...adapter,
			exit: (code) => {
				if (showFooter) {
					adapter.stdout(helpFooter(pkg.homepage, adapter.isTTY));
				}
				return adapter.exit(code);
			},
		},
	});
}
