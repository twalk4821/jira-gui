const { contextBridge, ipcRenderer } = require('electron');

export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        getTimelineIssues: (jqlQuery: string) => Promise<any>;
      };
    };
  }
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    getTimelineIssues: (jqlQuery: string) => ipcRenderer.invoke('get-timeline-issues', jqlQuery),
  }
});
