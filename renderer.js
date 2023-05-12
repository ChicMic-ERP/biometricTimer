
const { ipcRenderer } = require('electron');

let timerElement = null;
let observer = null;

ipcRenderer.on('window-minimized', () => {
  timerElement = document.getElementById('timer');
  observer = new MutationObserver(() => {
    let timerValue = timerElement.innerText;
    ipcRenderer.send('timer-value', timerValue);
  });

  console.log('observing');
  observer.observe(timerElement, { childList: true, subtree: true, characterData: true });
});

ipcRenderer.on('window-restored', () => {
  if (observer) {
    console.log('stop observing');
    observer.disconnect();
    observer = null;
  }
});
