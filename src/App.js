import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MOCK_DATA } from './mock';

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        setIssues(MOCK_DATA);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="container mt-4">
      <h1 className="mb-4">JIRA Issues for SFG-62</h1>
      {loading && <div className="alert alert-info" role="alert">Loading issues...</div>}
      {error && <div className="alert alert-danger" role="alert">Error: {error}</div>}
      {!loading && issues.length === 0 && !error && <div className="alert alert-warning" role="alert">No issues found in epic SFG-62.</div>}
      {issues.length > 0 && (
        <ul className="list-group">
          {issues.map(issue => (
            <li key={issue.key} className="list-group-item">
              <strong>{issue.key}</strong>: {issue.fields.summary}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
