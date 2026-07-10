/** Endpoints for GitHub's status page API. */
export const StatusAPIEndpoints = {
	components() {
		return withBase('/components.json');
	},
	Incidents: {
		all() {
			return withBase('/incidents.json');
		},
		unresolved() {
			return withBase('/incidents/unresolved.json');
		},
	},
	ScheduledMaintenances: {
		active() {
			return withBase('/scheduled-maintenances/active.json');
		},
		all() {
			return withBase('/scheduled-maintenances.json');
		},
		upcoming() {
			return withBase('/scheduled-maintenances/upcoming.json');
		},
	},
	status() {
		return withBase('/status.json');
	},
	/** @private */
	subscriber(subscriberId: string) {
		const subId = encodeURIComponent(subscriberId);
		return withBase(`/subscribers/${subId}.json`);
	},
	/** @private */
	subscribers() {
		return withBase('/subscribers.json');
	},
	summary() {
		return withBase('/summary.json');
	},
};

const withBase = <const Path extends string, const Base extends string = '/api/v2/'>(
	path: Path,
	base: Base = '/api/v2/' as Base,
) => `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}` as WithBase<Base, Path>;

type TrimLeadingSlash<Value extends string> = Value extends `/${infer Rest}` ? TrimLeadingSlash<Rest> : Value;
type TrimTrailingSlash<Value extends string> = Value extends `${infer Rest}/` ? TrimTrailingSlash<Rest> : Value;
type WithBase<Base extends string, Path extends string> = `${TrimTrailingSlash<Base>}/${TrimLeadingSlash<Path>}`;
