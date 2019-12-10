const browserAppData = this.browser || this.chrome;
 
 // Map of Panel connections. The 'tabId' is used as key.
 // There are two connections/ports for every tabId
 // 1) Port to the panel script
 // 2) Port to the content script
 //
 // Example:
 // connections[1].panel => pane port
 // connections[1].content => content port
 var connections = {};
 
//  /**
//   * Collect all connections created by the panel
//   * and content scripts.
//   */
//  chrome.runtime.onConnect.addListener(function (port) {
//    console.log("background-script onConnect", port);
//     console.log("HELLO WORLD")
//    // Only collect connections coming from the panel script
//    // and content script.
//    if (port.name != "panel" && port.name != "content") {
//      return;
//    }
 
//    // Define listener as a function so, we can remove it later.
//    var extensionListener = function (message) {
//      console.log("background-script port.onMessage", message, port);
 
//      var tabId = port.sender.tab ? port.sender.tab.id : message.tabId;
 
//      // The original connection event doesn't include the tab ID of the
//      // DevTools page, so we need to send it explicitly (attached
//      // to the 'init' event).
//      if (message.action == "init") {
//        if (!connections[tabId]) {
//          connections[tabId] = {};
//        }
//        connections[tabId][port.name] = port;
//        return;
//      }
 
//      // Other messages are relayed to specified target if any
//      // and if the connection exists.
//      if (message.target) {
//        var conn = connections[tabId][message.target];
//        if (conn) {
//          conn.postMessage(message);
//        }
//      }
//    };
 
//    // Listen to messages sent from the panel script.
//    port.onMessage.addListener(extensionListener);
 
//    // Remove panel connection on disconnect.
//    // TODO: properly implement the clean up.
//    port.onDisconnect.addListener(function(port) {
//      console.log("background-script onDisconnect", port);
 
//      port.onMessage.removeListener(extensionListener);
 
//      var tabs = Object.keys(connections);
//      for (var i=0, len=tabs.length; i < len; i++) {
//        if (connections[tabs[i]][port.name] === port) {
//          console.log("background-script onDisconnect connections cleanup",
//                      {tabId: tabs[i], portName: port.name});
//          delete connections[tabs[i]][port.name];
 
//          // If there is not port associated to the tab, remove it
//          // from the connections map.
//          if (Object.keys(connections[tabs[i]]).length === 0) {
//            console.log("background-script onDisconnect remove connection object",
//                        {tabId: tabs[i]});
//            delete connections[tabs[i]];
//          }
//          break;
//        }
//      }
//    });
//  });
 
 /**
  * Receive one-time message from panel and relay to the content script.
  * This is for messages sent through 'chrome.runtime.sendMessage'.
  * We could use port for that but this is here as an example of one-time messages.
  */
//  browserAppData.runtime.onMessage.addListener(function(request, sender) {
//    console.log("background-script runtime.onMessage", request, sender);
 
//    // Messages from content scripts should have sender.tab set.
//    // The are all relayed to the "panel" connection.
//    if (request.target == "content" && request.tabId) {
//      chrome.tabs.sendMessage(request.tabId, request);
//    }
 
//  });

function handleMessage(request, sender, sendResponse) {
  console.log("Message from the content script: " + request);
  
  let sendGetXPathCommand = (tabs) => {
     browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "getXpath",
        element: request
      });
  }

  if(request.command === "getXpath"){
    browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(sendGetXPathCommand)
        .catch((e) => {console.log(e)})
  } 

  
 
  sendResponse({response: "Background sent event to main"});
}

browser.runtime.onMessage.addListener(handleMessage);