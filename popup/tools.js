
const browserAppData = this.browser || this.chrome;

let downloadMessage

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
      window.close()
    }

    function sendSettingsCommand(tabs) {
      browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "settings",
      });
    }

    function changeDownloadSetting(tabs){
      console.log(tabs)
      console.log(downloadMessage)
      browserAppData.tabs.sendMessage(tabs[0].id, downloadMessage);
    }

    function saveToFileCommand(tabs){
      console.log(tabs)
      console.log(downloadMessage)
      browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "saveToFile"
      });
    }

    function copyToClipBoardCommand(tabs){
      console.log(tabs)
      console.log(downloadMessage)
      browserAppData.tabs.sendMessage(tabs[0].id, {
        command: "copyToClipBoard"
      });
    }

    function reportError(error) {
      console.error(`Could not execute: ${error}`);
    }

    /**
     * Parse click result from listener in popup
     * specifically looking for elements in tools.html
     */
    if (e.target.classList.contains("select")) {
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(sendSelectCommand)
        .catch(reportError);
    } 

    if (e.target.classList.contains("settings")) {
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(sendSettingsCommand)
        .catch(reportError);
    } 

    if(e.target.id === "downloadTypeRaw"){
      console.log("downloadTypeRaw")
       downloadMessage = {
        command: "changeDownload",
        downloadType: "raw"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }

    if(e.target.id === "downloadTypeFile"){
      console.log("downloadTypeFile")
      downloadMessage = {
        command: "changeDownload",
        downloadType: "file"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }

    if(e.target.id === "resultTypeRaw"){
      console.log("resultTypeRaw")
      downloadMessage = {
        command: "changeDownload",
        result: "XPATH"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }

    if(e.target.id === "resultTypeVariables"){
      console.log("resultTypeVariables")
      downloadMessage = {
        command: "changeDownload",
        result: "VAR"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }

    if(e.target.id === "resultTypePom"){
      console.log("resultTypePom")
      downloadMessage = {
        command: "changeDownload",
        result: "POM"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }

    if(e.target.id === "programLanguageJava"){
      console.log("programLanguageJava")
      downloadMessage = {
        command: "changeDownload",
        language: "JAVA"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }
    if(e.target.id === "programLanguagePython"){
      console.log("programLanguagePython")
      downloadMessage = {
        command: "changeDownload",
        language: "PYTHON"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }

    if(e.target.id === "programLanguageCSharp"){
      console.log("programLanguageCSharp")
      downloadMessage = {
        command: "changeDownload",
        language: "C#"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }
    if(e.target.id === "programLanguagePHP"){
      console.log("programLanguagePHP")
      downloadMessage = {
        command: "changeDownload",
        language: "PHP"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }
    if(e.target.id === "programLanguagePerl"){
      console.log("programLanguagePerl")
      downloadMessage = {
        command: "changeDownload",
        language: "PERL"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }
    if(e.target.id === "programLanguageRuby"){
      console.log("programLanguageRuby")
      downloadMessage = {
        command: "changeDownload",
        language: "RUBY"
      }
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(changeDownloadSetting)
        .catch(reportError);
    }
    
    if(e.target.id === "saveToFileButton"){
      console.log("saveToFileButton")
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(saveToFileCommand)
        .catch(reportError);
    }
    if(e.target.id === "copyToClipBoardButton"){
      console.log("copyToClipBoardButton")
      browserAppData.tabs.query({ active: true, currentWindow: true })
        .then(copyToClipBoardCommand)
        .catch(reportError);
    }

  });
}

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
  console.error(`error loading content script: ${error.message}`);
}

function startPopper(){
  browserAppData.tabs.executeScript({ file: "/lib/popper.min.js" }).catch(reportExecuteScriptError);
}

function startBootStrap(){
browserAppData.tabs.executeScript({ file: "/lib/bootstrap-4.4.1-dist/js/bootstrap.min.js" }).catch(reportExecuteScriptError);
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browserAppData.tabs.executeScript({ file: "/lib/FileSaver.js" }).catch(reportExecuteScriptError);
browserAppData.tabs.executeScript({ file: "/lib/jquery-3.4.1.min.js" }).then(startPopper).then(startBootStrap).catch(reportExecuteScriptError);
browserAppData.tabs.executeScript({ file: "/content_scripts/main.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
browserAppData.tabs.executeScript({ file: "/content_scripts/select.js" }).catch(reportExecuteScriptError);


