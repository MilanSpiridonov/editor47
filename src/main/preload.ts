// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, ipcMain, IpcMainEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, fun c: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => fun(...args));
    },
  },
  
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);


export type ElectronHandler = typeof electronHandler;

