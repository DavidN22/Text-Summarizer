const menuItemId = 'summarize';

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: menuItemId,
    title: 'Summarize Text',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === menuItemId) {
    const selectedText = info.selectionText;
    summarizeText(selectedText, tab);
  }
});

async function summarizeText(text, tab) {
    try {
      const summary = await callServerSideAPI(text);
  
      // Execute the content script
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_script.js'],
      }, () => {
        // Send the summary to the content script
        chrome.tabs.sendMessage(tab.id, { action: 'displaySummary',  summary });
      });
    } catch (error) {
    
      // Send the error message to the content script
      chrome.tabs.sendMessage(tab.id, { action: 'displayError', error: error.message });
    }
  }

async function callServerSideAPI(text) {
  const url = 'http://localhost:3000/summarize';
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text}),
  };

  const response = await fetch(url, requestOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error summarizing text');
  }

  return data;
}
