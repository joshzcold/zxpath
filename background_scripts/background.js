function handleMessage(request, sender, sendResponse) {
  console.log("Message from the content script: " + request.command);

  if(request.command === "getXpath"){
    console.log("HELLO, inside of getXpath in background.js", request)
    chrome.tabs.query({ active: true, currentWindow: true }, function(result){
      result.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          command: "getXpath",
          element: request
        });
      });
    })
  }
  else if (request.command === "elementCommand") {
    console.log("HELLO, inside of elementCommand in background.js", result)
    chrome.tabs.query({ active: true, currentWindow: true }, function(result){
      result.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          command: request.command,
          content: request.content + " through background.js"
        });
      });
    })
  }
  else if (request.command === "removeXpath") {
    console.log("HELLO, inside of removeXpath in background.js", request)
    chrome.tabs.query({ active: true, currentWindow: true }, function(result){
      result.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          command: request.command,
          element: request
        });
      });
    })
  }
  sendResponse({response: "Background sent event to content scripts"});
}

chrome.runtime.onMessage.addListener(handleMessage);
