import React, { useState, useEffect } from 'react';
import './App.css';
import { JiraIssue } from './types';
import { MOCK_DATA } from './mock';
import { parseJiraToReact } from './utils/jiraReactParser';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  [periodKey: string]: JiraIssue[];
}

const getTimeline = async () => {
  try {
    // const jqlQuery = "project = WDY AND status in (\"To Do\", \"In Progress\") ORDER BY \"Start Date\" ASC";
    // const issues2 = await searchIssues(jqlQuery);
    const issues = MOCK_DATA.filter(issue => issue.key.includes("WDY"));
    const timeline: any = {};

    // Start from Thursday, July 24, 2025
    let currentDate = new Date('2025-05-29T00:00:00.000Z');

    // Generate 2-week periods for the next 6 months
    for (let i = 0; i < 13; i++) { // 13 periods = 6 months
      const periodStart = new Date(currentDate);
      const periodEnd = new Date(currentDate);
      periodEnd.setDate(currentDate.getDate() + 13); // 13 days after start for a 14-day period

      const periodKey = `${periodStart.toISOString()} - ${periodEnd.toISOString()}`;
      timeline[periodKey] = [];

      currentDate.setDate(currentDate.getDate() + 14); // Move to the start of the next period
    }

    issues.forEach((issue: JiraIssue) => {
      const startDateStr = issue.fields[JiraCustomFields['StartDate']];
      const resolutionDateStr = issue.fields.resolutiondate;

      let dateToUse: Date | null = null;

      // Find the current period
      const today = new Date();
      let currentPeriodKey: string | null = null;
      for (const periodKey in timeline) {
        const [startStr, endStr] = periodKey.split(' - ');
        const periodStart = new Date(startStr);
        const periodEnd = new Date(endStr);
        if (today >= periodStart && today <= periodEnd) {
          currentPeriodKey = periodKey;
          break;
        }
      }

      if (issue.fields.status.name === 'In Progress' && currentPeriodKey) {
        // If in progress, add to current period
        timeline[currentPeriodKey].push(issue);
      } else if (startDateStr) {
        dateToUse = new Date(startDateStr);
      } else if (resolutionDateStr) {
        dateToUse = new Date(resolutionDateStr);
      }

      if (dateToUse) {
        for (const periodKey in timeline) {
          const [startStr, endStr] = periodKey.split(' - ');
          const periodStart = new Date(startStr);
          const periodEnd = new Date(endStr);

          if (dateToUse >= periodStart && dateToUse <= periodEnd) {
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
};

const getDayDiff = (startDate: Date, endDate: Date) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

function App() {
  const [timeline, setTimeline] = useState<Timeline>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState<JiraIssue | null>(null);
  const [showPopup, setShowPopup] = useState(false);

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

  const handleBarClick = (issue: JiraIssue) => {
    setSelectedIssue(issue);
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedIssue(null);
  };


  const periods = Object.keys(timeline).map(periodKey => {
                const [start, end] = periodKey.split(' - ');
                const formattedPeriod = `${formatDate(new Date(start))} - ${formatDate(new Date(end))}`;
                const today = new Date();
                const isCurrentPeriod = today >= new Date(start) && today <= new Date(end);
                return <div key={periodKey} className={`chart-header-item ${isCurrentPeriod ? 'current-period' : ''}`}>{formattedPeriod}</div>
              })
  periods.unshift(<div key={'gutter'} className="chart-header-gutter"></div>)

  return (
    <div className="container mt-4">
      <h1 className="mb-4">JIRA Issues Timeline</h1>
      {loading && <div className="alert alert-info" role="alert">Loading timeline...</div>}
      {error && <div className="alert alert-danger" role="alert">Error: {error}</div>}
      {!loading && Object.keys(timeline).length === 0 && !error && <div className="alert alert-warning" role="alert">No issues found for the timeline.</div>}
      {!loading && Object.keys(timeline).length > 0 && (
        <div className="waterfall-chart">
          <div className="chart-header">
            <div className="chart-header-periods">
              {periods}
            </div>
          </div>
          <div className="chart-body">
            {Object.values(timeline).flat().map(issue => {
              const startDateStr = issue.fields[JiraCustomFields.StartDate];
              const endDateStr = issue.fields[JiraCustomFields.EndDate];

              let barStartDate: Date;
              let barEndDate: Date;

              let today = new Date();
              let currentPeriodStart: Date | null = null;
              let currentPeriodEnd: Date | null = null;

              for (const periodKey in timeline) {
                const [startStr, endStr] = periodKey.split(' - ');
                const periodStart = new Date(startStr);
                const periodEnd = new Date(endStr);

                if (today >= periodStart && today <= periodEnd) {
                  currentPeriodStart = periodStart;
                  currentPeriodEnd = periodEnd;
                  break;
                }
              }

              if (issue.fields.status.name === 'In Progress' && currentPeriodStart && currentPeriodEnd) {
                barStartDate = currentPeriodStart;
                barEndDate = currentPeriodEnd;
              } else if (startDateStr && endDateStr) {
                // Use actual start and end dates if available
                barStartDate = new Date(startDateStr);
                barEndDate = new Date(endDateStr);
              } else if (issue.fields.resolutiondate) {
                // If only resolution date, span the whole 2-week period
                const resolutionDate = new Date(issue.fields.resolutiondate);
                let foundPeriodStart: Date | null = null;
                let foundPeriodEnd: Date | null = null;

                for (const periodKey in timeline) {
                  const [periodStartStr, periodEndStr] = periodKey.split(' - ');
                  const currentPeriodStart = new Date(periodStartStr);
                  const currentPeriodEnd = new Date(periodEndStr);

                  if (resolutionDate >= currentPeriodStart && resolutionDate <= currentPeriodEnd) {
                    foundPeriodStart = currentPeriodStart;
                    foundPeriodEnd = currentPeriodEnd;
                    break;
                  }
                }

                if (foundPeriodStart && foundPeriodEnd) {
                  barStartDate = foundPeriodStart;
                  barEndDate = foundPeriodEnd;
                } else {
                  // Fallback if resolution date doesn't fall into any period (shouldn't happen if timeline is correctly generated)
                  return null;
                }
              } else {
                // No relevant dates, don't display
                return null;
              }

              const periodKeys = Object.keys(timeline);
              const firstPeriodStartDate = new Date(periodKeys[0].split(' - ')[0]);
              const lastPeriodEndDate = new Date(periodKeys[periodKeys.length - 1].split(' - ')[1]);
              const totalDays = getDayDiff(firstPeriodStartDate, lastPeriodEndDate);
              const startDay = getDayDiff(firstPeriodStartDate, barStartDate);
              const duration = getDayDiff(barStartDate, barEndDate) || 1; // Ensure duration is at least 1 day

              today = new Date();
              let currentPeriodHighlight = null;
              for (const periodKey in timeline) {
                const [startStr, endStr] = periodKey.split(' - ');
                const periodStart = new Date(startStr);
                const periodEnd = new Date(endStr);

                if (today >= periodStart && today <= periodEnd) {
                  const highlightStartDay = getDayDiff(firstPeriodStartDate, periodStart);
                  const highlightDuration = getDayDiff(periodStart, periodEnd) || 1;
                  currentPeriodHighlight = (
                    <div
                      className="chart-column-highlight"
                      style={{
                        left: `${(highlightStartDay / totalDays) * 100}%`,
                        width: `${(highlightDuration / totalDays) * 100}%`,
                      }}
                    ></div>
                  );
                  break;
                }
              }

              return (
                <div key={issue.key} className="chart-row">
                  <div className="chart-row-label">
                    <div>{issue.key}</div>
                  </div>
                  <div className="chart-row-bars">
                    {currentPeriodHighlight}
                    <div
                      className={`chart-bar ${issue.fields.resolutiondate ? 'chart-bar-completed' : ''} ${issue.fields.status.name === 'In Progress' ? 'chart-bar-in-progress' : ''}`}
                      style={{
                        left: `${(startDay / totalDays) * 100}%`,
                        width: `${(duration / totalDays) * 100}%`,
                      }}
                      title={`${issue.fields.summary} (${issue.fields.status.name})`}
                      onClick={() => handleBarClick(issue)}
                    >
                      {issue.fields.summary}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showPopup && selectedIssue && (
        <div className="issue-popup-overlay" onClick={handleClosePopup}>
          <div className="issue-popup-content" onClick={e => e.stopPropagation()}>
            <h2>{selectedIssue.key}: {selectedIssue.fields.summary}</h2>
            <br/>
            {parseJiraToReact(selectedIssue.fields.description || 'No description provided.')}
            <p><strong>Status:</strong> {selectedIssue.fields.status.name}</p>
            <p><strong>Story Points:</strong> {selectedIssue.fields[JiraCustomFields.StoryPoints] || 'N/A'}</p>
            <p><strong>Assignee:</strong> {selectedIssue.fields.assignee?.displayName || 'Unassigned'}</p>
            <p>
              <strong>Link:</strong> <a href={`https://your-jira-instance.com/browse/${selectedIssue.key}`} target="_blank" rel="noopener noreferrer">
                {`https://jira.sie.sony.com/browse/${selectedIssue.key}`}
              </a>
            </p>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
