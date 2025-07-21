import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getIssuesInEpic, searchIssues } from './src/utils';
import { MOCK_DATA } from './src/mock';
import { JiraIssue } from './src/types';

const __dirname = path.dirname(__filename);

const JiraCustomFields = {
  StoryPoints: 'customfield_10142',
  DueDate: 'customfield_12362',
  StartDate: 'customfield_14945',
  EndDate: 'customfield_14946',
};

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('get-issues-in-epic', async (event: any, epicKey: string) => {
    try {
      const issues = await getIssuesInEpic(epicKey);
      return issues;
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  ipcMain.handle('get-timeline-issues', async (event: any, jqlQuery: string) => {
    try {
      // const issues = await searchIssues(jqlQuery);
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
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
