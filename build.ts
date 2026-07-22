#!/usr/bin/env -S bun --bun
import fs from 'node:fs';
import path from 'node:path';

import type { UserConfig as TsDownUserConfig } from 'tsdown';
import * as tsdown from 'tsdown';

import { cli, command, flag } from '@kjanat/dreamcli';
import site from './demo/index.html';

type TsDownLogLevel = NonNullable<TsDownUserConfig['logLevel']>;
const logLevels = ['silent', 'error', 'warn', 'info'] satisfies readonly [
	TsDownLogLevel,
	...TsDownLogLevel[],
];

const getHerDoneBitch = command('build')
	.description('Build the project.')
	.flag('watch', flag.boolean().alias('w').env('WATCH'))
	.flag('log-level', flag.enum(logLevels).alias('logLevel', { hidden: true }).alias('l').default('info'))
	.flag(
		'out-dir',
		flag.path({ type: 'directory', mustExist: false }).alias('outdir', { hidden: true }).alias('o').default('dist').describe(
			`directory relative to ${import.meta.file}`,
		),
	)
	.flag('clean', flag.boolean().negatable().alias('c').default(true).describe('clean the output directory before building'))
	.derive(async ({ flags }) => {
		const outdir = path.join(import.meta.dir, flags['out-dir']);
		const browserOutDir = path.join(outdir, 'browser');
		const binOutDir = path.join(outdir, 'bin');
		const siteOutDir = path.join(outdir, 'site');

		if (flags.clean) await Bun.$`rm -rf ${outdir}`.cwd(import.meta.dir);
		fs.mkdirSync(outdir, { recursive: true });

		const tsdownBuildDefaults = {
			clean: false,
			dts: true,
			exports: false,
			format: 'es',
			unbundle: false,
			minify: true,
			outDir: flags['out-dir'],
			watch: flags.watch,
			logLevel: flags['log-level'],
		} satisfies TsDownUserConfig;

		return { outdir: flags['out-dir'], browserOutDir, binOutDir, siteOutDir, tsdownBuildDefaults };
	})
	.derive(({ flags, ctx }) => {
		const bunFunction = flags.watch
			? Bun.serve({
				routes: { '/': site },
				development: {
					hmr: true,
					console: true,
				},
			})
			: Bun.build({
				entrypoints: ['demo/index.html'],
				outdir: ctx.siteOutDir,
				compile: true,
				minify: true,
				target: 'browser',
			});

		return { bunFunction };
	})
	.action(async ({ ctx }) => {
		await Promise.all([
			tsdown.build({
				...ctx.tsdownBuildDefaults,
				entry: 'src/index.ts',
				dts: {
					entry: ['src/*.ts', '!src/main.ts', '!src/browser.ts'],
					tsconfig: 'tsconfig.build.json',
				},
				platform: 'node',
			}),
			tsdown.build({
				...ctx.tsdownBuildDefaults,
				entry: { cli: 'src/main.ts' },
				dts: false,
				// exports: { bin: { 'github-up': './src/main.ts' } },
				platform: 'node',
				outDir: ctx.binOutDir,
			}),
			tsdown.build({
				...ctx.tsdownBuildDefaults,
				entry: { browser: 'src/browser.ts' },
				dts: { entry: ['src/browser.ts'], tsconfig: 'tsconfig.build.json' },
				// deps: { alwaysBundle: ['statuspage.io'], neverBundle: ['@kjanat/dreamcli'] },
				platform: 'browser',
				outDir: ctx.browserOutDir,
			}),
			ctx.bunFunction,
		]);
	});

void cli('build')
	.default(getHerDoneBitch)
	.manifest({ from: import.meta.url })
	.links()
	.run();
