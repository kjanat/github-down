import pkg from '#pkg' with { type: 'json' };
import { cli } from '@kjanat/dreamcli';

import { downdetectorCommand, githubCommand, statusCommand, webCommand } from '#github-up/cli/commands';

const repoUrl = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');

const githubUp = cli(pkg.name)
	.version(pkg.version)
	.description(pkg.description)
	.links({ name: repoUrl, version: `${repoUrl}/releases/tag/v${pkg.version}` })
	.default(statusCommand, { route: true })
	.command(githubCommand)
	.command(downdetectorCommand)
	.command(webCommand)
	.completions();

export { githubUp };
