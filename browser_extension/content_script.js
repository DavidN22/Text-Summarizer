chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'displaySummary') {
    displaySummary(request.summary);
  } else if (request.action === 'displayError') {
    displayError(request.error);
  }

  else if (request.action === 'displayLoading') {
    displaySummary('Loading...', false, true);
  }
});
function displayError(error) {
  // Create an error message using the error text
  const errorMessage = `Error: ${error}`;

  // Call the displaySummary function with the error message
  displaySummary(errorMessage, true);
}

function displaySummary(summary, isError = false, isLoading = false){
  const popup = document.createElement('div');
  popup.id = 'summary-popup';

  const existingPopup = document.getElementById('summary-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Inject CSS styles into the page
  if (isError) {
    console.log('error');
    popup.classList.add('error');
  } else {

    popup.classList.remove('error');
  }

  if (isLoading) {
    popup.classList.add('loading');
  } else {
    popup.classList.remove('loading');
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('popup.css');
  document.head.appendChild(link);


  // Add the summary text
  const summaryText = document.createElement('p');
  summaryText.id = 'summary-text';
  popup.appendChild(summaryText);






  // Animate text display
  let words = summary.split(' ');
  let index = 0;
  function displayNextWord() {
    if (index < words.length) {
      summaryText.innerText += (index > 0 ? ' ' : '') + words[index];
      index++;
      setTimeout(displayNextWord, 150); // Adjust the number to control the speed of text display
    }
  }
  displayNextWord();

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.id = 'close-button';
  closeButton.innerText = 'X';
  closeButton.onclick = () => popup.remove();
  popup.appendChild(closeButton);

  // Add the popup to the DOM
  document.body.appendChild(popup);

  restorePopupPosition(popup);
  makeDraggable(popup);
}
function makeDraggable(popup) {
  let isMouseDown = false;
  let offsetX = 0;
  let offsetY = 0;

  popup.addEventListener('mousedown', (event) => {
    if (event.target.id === 'summary-text') {
      return;
    }
    isMouseDown = true;
    offsetX = event.clientX - popup.getBoundingClientRect().left;
    offsetY = event.clientY - popup.getBoundingClientRect().top;
    event.preventDefault();
  }, { passive: false });



  popup.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
      const x = event.clientX - offsetX;
      const y = event.clientY - offsetY;
      popup.style.left = `${x}px`;
      popup.style.top = `${y}px`;
      event.preventDefault();
    }
  }, { passive: false });

  popup.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      savePopupPosition(popup);
    }
  });
}

function shouldClosePopup(popup, target) {
  return !popup.contains(target);
}
function savePopupPosition(popup) {
  const position = {
    left: popup.style.left,
    top: popup.style.top,
  };
  sessionStorage.setItem('popupPosition', JSON.stringify(position));
}

function restorePopupPosition(popup) {
  const position = JSON.parse(sessionStorage.getItem('popupPosition'));
  if (position) {
    popup.style.left = position.left;
    popup.style.top = position.top;
  }
}

window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('popupPosition');
});