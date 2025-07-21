export interface JiraIssue {
  expand?: string;
  id: string;
  self: string | null;
  key: string;
  fields: JiraIssueFields;
}

export interface JiraIssueFields {
  summary: string;
  description?: string; // Can be wiki markup or ADF
  status: JiraStatus;
  issuetype: JiraIssueType;
  project: JiraProject;
  assignee?: JiraUser | null;
  reporter?: JiraUser;
  created: string;
  updated: string;
  resolutiondate: string | null;
  parent?: JiraIssueParent | null;
  [key: string]: any; // allow extra fields
}

export interface JiraStatus {
  name: string;
  id: string;
  self: string | null;
  description?: string;
  iconUrl?: string;
  statusCategory?: {
    name: string;
    key: string;
    colorName: string;
    self: string | null;
    id: string | number | null;
  };
}

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  subtask: boolean;
  self?: string;
  iconUrl?: string;
  avatarId?: number;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey?: string;
  self?: string;
  avatarUrls?: { [key: string]: string };
  projectCategory?: { id: string; name: string; description: string; self: string };
}

export interface JiraUser {
  accountId?: string;
  displayName: string;
  emailAddress?: string;
  active: boolean;
  timeZone?: string;
  self?: string;
  name?: string;
  key?: string;
  avatarUrls?: { [key: string]: string };
}

export interface JiraIssueParent {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: JiraIssueType;
  };
}

export interface JiraFieldsItem {
  id: string;
  name: string;
}
