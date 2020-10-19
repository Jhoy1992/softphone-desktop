const { ipcRenderer } = require('electron');

window.addEventListener('keydown', event => {
  // console.log(event);
  ipcRenderer.sendToHost('keydown', event.key);
  ipcRenderer.send('keydown', event.key);
});
