// Event URL and Testing Types
export interface EventUrlState {
  url: string;
  isValid: boolean | null;
}

export interface EventTestState {
  isLoading: boolean;
  response: EventCheckResponse | null;
  error: string | null;
}

// DataLayer Event Types
export interface DataLayerEvent {
  vl_label?: string;
  event?: string;
  ecommerce?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface EventCheckResponse {
  success: boolean;
  message?: string;
  events?: DataLayerEvent[];
  allEvents?: DataLayerEvent[];
}

// GTM Types
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

// Component Props Types
export interface EventCardProps {
  event: GTMTags;
  eventUrl: EventUrlState;
  eventTest: EventTestState;
  onUrlChange: (eventId: string, value: string) => void;
  onTestEvent: (url: string, eventId: string) => void;
  onShowCode: (event: GTMTags) => void;
  onEdit: (event: GTMTags) => void;
  onRemove: (event: GTMTags) => void;
}

// Parameter Types
export interface VLParameter {
  vlParameter: string;
  gtmParameter: string;
  isArray: boolean;
}
