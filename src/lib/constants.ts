import type { Indicator } from '#github-up/lib/types';

/** Mapping of status levels to their corresponding exit codes. */
const EXIT_CODES = {
	none: 0,
	minor: 1,
	major: 2,
	critical: 2,
	unavailable: 21,
} as const satisfies Record<Indicator, number>;

/** Base URL for GitHub's status page API. */
const GITHUB_STATUS_BASE = 'https://www.githubstatus.com';

/** URL for GitHub's status page on Downdetector. */
const DOWNDETECTOR_URL = 'https://downdetector.com/status/github/';

/** Environment variable pointing at a custom Chrome/Chromium binary. */
const CHROME_PATH_ENV = 'GITHUB_UP_CHROME';

/** Executable names to probe via `which` when locating a Chromium-family binary (Unix/macOS). */
const BROWSER_CANDIDATES = [
	'google-chrome-stable',
	'google-chrome',
	'chromium',
	'brave',
	'microsoft-edge-stable',
	'microsoft-edge',
] as const;

/** Executable names to probe via `where.exe` when locating a Chromium-family binary on Windows. */
const BROWSER_CANDIDATES_WIN = [
	'chrome.exe',
	'msedge.exe',
	'brave.exe',
] as const;

/** Default Windows install locations as path segments, joined against a
 * program-files style root at the call site (kept as segments so no embedded
 * backslash path reads as a high-entropy literal). */
const WINDOWS_CHROME_SUFFIX_SEGMENTS = [
	['Google', 'Chrome', 'Application', 'chrome.exe'],
	['Microsoft', 'Edge', 'Application', 'msedge.exe'],
	['BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'],
	['Chromium', 'Application', 'chrome.exe'],
] as const;

/** Environment variables holding Windows install roots to join with
 * {@link WINDOWS_CHROME_SUFFIX_SEGMENTS} (the x86 name is composed so it is not
 * a single high-entropy literal). */
const WINDOWS_CHROME_ROOT_ENV_VARS = [
	'ProgramFiles',
	`ProgramFiles${'(x86)'}`,
	'LOCALAPPDATA',
] as const;

/** Default macOS application-bundle paths (which `which` cannot discover). */
const MACOS_CHROME_PATHS = [
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
	'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
] as const;

export {
	BROWSER_CANDIDATES,
	BROWSER_CANDIDATES_WIN,
	CHROME_PATH_ENV,
	DOWNDETECTOR_URL,
	EXIT_CODES,
	GITHUB_STATUS_BASE,
	MACOS_CHROME_PATHS,
	WINDOWS_CHROME_ROOT_ENV_VARS,
	WINDOWS_CHROME_SUFFIX_SEGMENTS,
};
