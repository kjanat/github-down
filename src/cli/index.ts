import { downdetectorCommand, githubCommand, statusCommand, webCommand } from '#github-up/cli/commands';
import { name, repository, version } from '#pkg' with { type: 'json' };

import { cli, packageRepositoryUrl } from '@kjanat/dreamcli';

const repoUrl = packageRepositoryUrl({ repository })!;

const githubUp = cli(name)
	.manifest({ from: import.meta.url })
	.links({ name: repoUrl, version: `${repoUrl}/releases/tag/v${version}` })
	.default(statusCommand, { route: true })
	.command(githubCommand)
	.command(downdetectorCommand)
	.command(webCommand)
	.completions();

export { githubUp };
