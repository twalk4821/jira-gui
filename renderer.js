const { ipcRenderer } = require('electron');

document.getElementById('fetch-button').addEventListener('click', async () => {
  const issuesDiv = document.getElementById('issues');
  issuesDiv.innerHTML = '<p>Loading issues...</p>';

  try {
    console.log("helo")
    const issues = await ipcRenderer.invoke('get-issues-in-epic', 'SFG-62');
    console.log("issues")
    if (issues.length === 0) {
      issuesDiv.innerHTML = '<p>No issues found in epic SFG-62.</p>';
      return;
    }

    const issuesList = document.createElement('ul');
    issues.forEach(issue => {
      const listItem = document.createElement('li');
      listItem.textContent = `${issue.key}: ${issue.fields.summary}`;
      issuesList.appendChild(listItem);
    });

    issuesDiv.innerHTML = '';
    issuesDiv.appendChild(issuesList);

  } catch (error) {
    console.error('Error fetching issues:', error);
    issuesDiv.innerHTML = `<p>Error fetching issues: ${error.message}</p>`;
  }
});