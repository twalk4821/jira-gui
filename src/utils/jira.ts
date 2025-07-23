import axios from 'axios';
import { JiraFieldsItem, JiraIssue } from '../types';
// import dotenv from 'dotenv';

// dotenv.config();

const JIRA_BASE_URL = 'https://jira.sie.sony.com/'
const JIRA_EMAIL = 'tyler.walker@sony.com'
const JIRA_API_TOKEN = ''
const GITHUB = ''
const GITHUB2 = ''

const client = axios.create({
  baseURL: JIRA_BASE_URL,
  headers: {
    'Access-Control-Allow-Credentials': 'true',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JIRA_API_TOKEN}`,
  },
});

const owner = "SIE-Private";
const repo = "rnps-explore-hub";
const baseBranch = "feat/custom-presence-alpha";

export async function listPullRequests() {
  try {
    const response = await axios.get(
      `https://github.sie.sony.com/api/v3/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${GITHUB2}`,
        },
        params: {
          state: "all", // or 'open', 'closed'
          base: baseBranch
        }
      }
    );

    const pullRequests = response.data;
    return pullRequests;
  } catch (error: any) {
    console.error("Error fetching PRs:", error.response?.data || error.message);
  }
}

listPullRequests();

/**
 * Fetches a JIRA issue by its key.
 * @param {string} issueKey - The key of the JIRA issue to fetch (e.g.: 'WDY-4324').
 * @returns {Promise<any>} - The JIRA issue data.
 * @throws {Error} - If the request fails.
 * @example
 * const issue = await getIssue('WDY-4324');
 * console.log(issue);
 */
export async function getIssue(issueKey: string): Promise<JiraIssue>{
  const res = await client.get(`/rest/api/2/issue/${issueKey}`);
  return res.data;
}

/**
 * Fetches all issues in the specified epic.
 * @param {string} epicKey - The key of the epic to fetch issues for (e.g.: 'SFG-62')
 * @returns {Promise<any[]>} - An array of JIRA issues in the epic.
 * @example
 * const issues = await getIssuesInEpic('SFG-62');
 * console.log(issues);
 */
export async function getIssuesInEpic(epicKey: string): Promise<JiraIssue[]> {
  try {
    const jql = `"Epic Link"=${epicKey}`;
    const response = await client.get('/rest/api/2/search', {
      params: { jql }
    });
    return response.data.issues;
  } catch (error: any) {
    console.error('Error fetching issues in epic:', error?.message || error);
  }
  return [];
}

export async function getFields(): Promise<JiraFieldsItem[]> {
  const res = await client.get(`/rest/api/2/field/`);
  return res.data;
}

export async function getFieldByName(name: string): Promise<JiraFieldsItem | undefined> {
  const fields = await getFields();
  return fields.find(field => field.name === name);
}

export async function searchIssues(jql: string): Promise<JiraIssue[]> {
  try {
    const response = await client.get('/rest/api/2/search', {
      params: { jql }
    });
    return response.data.issues;
  } catch (error: any) {
    console.error('Error searching issues:', error?.message || error);
  }
  return [];
}
