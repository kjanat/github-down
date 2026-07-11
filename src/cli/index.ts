import { downdetectorCommand, githubCommand, statusCommand, webCommand } from '#github-up/cli/commands';
import pkg from '#pkg' with { type: 'json' };

import type { CLIBuilder } from '@kjanat/dreamcli';
import { cli, packageRepositoryUrl } from '@kjanat/dreamcli';

const repoUrl: string = packageRepositoryUrl({ repository: pkg.repository })!;

const githubUp: CLIBuilder = cli(pkg.name)
	.manifest(pkg)
	.links({
		name: repoUrl,
		version: `${repoUrl}/releases/tag/v${pkg.version}`,
	})
	.default(statusCommand, { route: true })
	.command(githubCommand)
	.command(downdetectorCommand)
	.command(webCommand)
	.completions();

export { githubUp };
