// Toolbar click opens the bundled React app. Creating a tab needs no tabs permission.
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});
