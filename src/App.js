import React, { useState } from 'react';

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedIssues = await window.electron.ipcRenderer.invoke('get-issues-in-epic', 'SFG-62');
      setIssues(fetchedIssues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>JIRA Issues for SFG-62</h1>
      <button onClick={fetchIssues} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Issues'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {issues.length > 0 && (
        <ul>
          {issues.map(issue => (
            <li key={issue.key}>{issue.key}: {issue.fields.summary}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
