
const browserAppData = this.browser || this.chrome;

/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
  document.addEventListener("click", (e) => {


    function sendSelectCommand(tabs) {
      browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "select",
      });
    }

    function sendDownloadCommand(tabs) {
      browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "download",
      });
    }

    function sendSettingsCommand(tabs) {
      browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "settings",
      });
    }



    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    /**
     * Parse click result from listener in popup
     * specifically looking for elements in tools.html
     */
    if (e.target.classList.contains("select")) {
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(sendSelectCommand)
        .catch(reportError);
    } else if (e.target.classList.contains("download")) {
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(sendDownloadCommand)
        .catch(reportError);
    } else if (e.target.classList.contains("settings")) {
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(sendSettingsCommand)
        .catch(reportError);
    }
  });
}

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browserAppData.tabs.executeScript({ file: "/content_scripts/main.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);

browserAppData.tabs.executeScript({ file: "/content_scripts/select.js" }).catch(reportExecuteScriptError);