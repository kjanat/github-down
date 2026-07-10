import { EXIT_CODES } from '#github-down/lib/constants';
import { checkDownDetector } from '#github-down/lib/downdetector';
import { checkGitHub } from '#github-down/lib/github';

const githubDown = { checkGitHub, checkDownDetector, EXIT_CODES };

export default githubDown;
export { checkDownDetector, checkGitHub, EXIT_CODES };

export type { ComponentStatus, IncidentImpactValue, IncidentStatusValue, Indicator, Result, Signal } from '#github-down/lib/types';

export type { Component, Incident, Summary } from 'statuspage.io';
