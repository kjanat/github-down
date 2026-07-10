import { EXIT_CODES } from '#github-up/lib/constants';
import { checkDownDetector } from '#github-up/lib/downdetector';
import { checkGitHub } from '#github-up/lib/github';

const githubUp = { checkGitHub, checkDownDetector, EXIT_CODES };

export default githubUp;
export { checkDownDetector, checkGitHub, EXIT_CODES };

export type { ComponentStatus, IncidentImpactValue, IncidentStatusValue, Indicator, Result, Signal } from '#github-up/types';
export type { Component, Incident, Summary } from '#github-up/types';
