export interface GTMExport {
	exportFormatVersion: number;
	exportTime: string;
	containerVersion: {
		path: string;
		accountId: string;
		containerId: string;
		containerVersionId: string;
		container: {
			path: string;
			accountId: string;
			containerId: string;
			name: string;
			publicId: string;
			usageContext: string[];
			fingerprint: string;
			tagManagerUrl: string;
			features: {
				[key: string]: boolean;
			};
			tagIds: string[];
		};
		tagManagerUrl: string;
		tag: GTMTags[];
		trigger: GTMTriggers[];
		variable: GTMVariables[];
		builtInVariable: GTMBuiltInVariables[];
	};
}
export interface GTMTags {
	accountId: string;
	containerId: string;
	tagId: string;
	name: string;
	type: string;
	parameter: Array<{
		type: string;
		key: string;
		value: string;
	}>;
	fingerprint: string;
	firingTriggerId: string[];
	tagFiringOption: string;
	monitoringMetadata: {
		type: string;
	};
	consentSettings: {
		consentStatus: string;
	};
}

export interface GTMTriggers {
	name: string;
	type: string;
	triggerId: string;
	accountId: string;
	containerId: string;
	fingerprint: string;
	filter: Array<{
		type: string;
		parameter: Array<{
			type: string;
			key: string;
			value: string;
		}>;
	}>;
	customEventFilter: Array<{
		type: string;
		parameter: Array<{
			type: string;
			key: string;
			value: string;
		}>;
	}>;
}

export interface GTMVariables {
	name: string;
	type: string;
	fingerprint: string;
	accountId: string;
	parameter: Array<{
		type: string;
		key: string;
		value: string;
	}>;
}

export interface GTMBuiltInVariables {
	accountId: string;
	containerId: string;
	name: string;
	type: string;
}
