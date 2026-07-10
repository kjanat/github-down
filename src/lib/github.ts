import { GITHUB_STATUS_BASE } from '#github-down/lib/constants';
import { StatusAPIEndpoints } from '#github-down/lib/github/endpoints';
import type { Result, Summary } from '#github-down/lib/types';

async function getErrorReason(response: Response): Promise<string> {
	try {
		const body = await response.text();
		const message = body.length > 0 ? `: ${body}` : '';
		return `Request failed with status code ${response.status}${message}`;
	} catch {
		const { status, statusText } = response;
		return `Request failed with status code ${status}: ${statusText}`;
	}
}

/** Checks the status of GitHub's services by querying their Statuspage API.
 *
 * @param baseUrl - Optional base URL for the GitHub Statuspage API.
 * @returns A promise that resolves to a Result object containing either the summary of the status or an error reason.
 */
async function check(
	baseUrl: string | URL = GITHUB_STATUS_BASE,
): Promise<Result> {
	try {
		const response = await fetch(
			new URL(StatusAPIEndpoints.summary(), baseUrl),
		);
		if (!response.ok) {
			const { headers } = response;
			return {
				headers,
				kind: 'unknown',
				reason: await getErrorReason(response),
			};
		}
		const summary: Summary = await response.json();
		return { headers: response.headers, kind: 'ok', summary };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		return { kind: 'unknown', reason: msg };
	}
}

export { check as checkGitHub, check as default };
