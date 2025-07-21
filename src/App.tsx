import React, { useState, useEffect } from 'react';

interface Issue {
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    [key: string]: any; // For custom fields like 'StartDate'
  };
}

const JiraCustomFields = {
  StoryPoints: 'customfield_10142',
  DueDate: 'customfield_12362',
  StartDate: 'customfield_14945',
  EndDate: 'customfield_14946',
};

interface Timeline {
  [periodKey: string]: Issue[];
}
import 'bootstrap/dist/css/bootstrap.min.css';
import { JiraIssue } from './types';
import { MOCK_DATA } from './mock';
import { searchIssues } from './utils';

const getTimeline = async () => {
  try {
    // const jqlQuery = "project = WDY AND status in (\"To Do\", \"In Progress\") ORDER BY \"Start Date\" ASC";
    // const issues2 = await searchIssues(jqlQuery);
    const issues = MOCK_DATA;
    const timeline: any = {};

    // Start from Thursday, July 24, 2025
    let currentDate = new Date('2025-07-24T00:00:00.000Z');

    // Generate 2-week periods for the next year
    for (let i = 0; i < 26; i++) { // 26 periods = 1 year
      const periodStart = new Date(currentDate);
      const periodEnd = new Date(currentDate);
      periodEnd.setDate(currentDate.getDate() + 13); // 13 days after start for a 14-day period

      const periodKey = `${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}`;
      timeline[periodKey] = [];

      currentDate.setDate(currentDate.getDate() + 14); // Move to the start of the next period
    }

    issues.forEach((issue: JiraIssue) => {
      const startDateStr = issue.fields[JiraCustomFields['StartDate']];
      if (startDateStr) {
        const issueStartDate = new Date(startDateStr);
        for (const periodKey in timeline) {
          const [startStr, endStr] = periodKey.split(' - ');
          const periodStart = new Date(startStr);
          const periodEnd = new Date(endStr);

          if (issueStartDate >= periodStart && issueStartDate <= periodEnd) {
            timeline[periodKey].push(issue);
            break;
          }
        }
      }
    });
    return timeline;
  } catch (error) {
    console.error('Error fetching timeline issues:', error);
    return {};
  }
}
function App() {
  const [timeline, setTimeline] = useState<Timeline>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      try {
        const jqlQuery = "project = WDY AND status in (\"To Do\", \"In Progress\") ORDER BY \"Start Date\" ASC";
        // const fetchedTimeline = await window.electron.ipcRenderer.getTimelineIssues(jqlQuery);

        const timeline = await getTimeline()
        setTimeline(timeline);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">JIRA Issues Timeline</h1>
      {loading && <div className="alert alert-info" role="alert">Loading timeline...</div>}
      {error && <div className="alert alert-danger" role="alert">Error: {error}</div>}
      {!loading && Object.keys(timeline).length === 0 && !error && <div className="alert alert-warning" role="alert">No issues found for the timeline.</div>}
      {!loading && Object.keys(timeline).length > 0 && (
        <div>
          {Object.keys(timeline).map(periodKey => (
            <div key={periodKey} className="mb-3">
              <h3 className="text-primary">{periodKey}</h3>
              {timeline[periodKey].length > 0 ? (
                <ul className="list-group">
                  {timeline[periodKey].map(issue => (
                    <li key={issue.key} className="list-group-item">
                      <strong>{issue.key}</strong>: {issue.fields.summary} (Status: {issue.fields.status.name})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No issues in this period.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
