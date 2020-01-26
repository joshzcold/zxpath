
const browserAppData = this.browser || this.chrome;

let downloadMessage

/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
  document.addEventListener("click", (e) => {
    /**
     * Parse click result from listener in popup
     * specifically looking for elements in tools.html
     */
    if (e.target.classList.contains("select")) {
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
            command: "select"
          });
          window.close();
        });
      })
    } 

    if (e.target.classList.contains("settings")) {
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
            command: "settings"
          });
        });
      })
    } 

    if(e.target.id === "downloadTypeRaw"){
      console.log("downloadTypeRaw")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        downloadType: "raw"
          });
        });
      })
    }

    if(e.target.id === "downloadTypeFile"){
      console.log("downloadTypeFile")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        downloadType: "file"
          });
        });
      })
    }

    if(e.target.id === "resultTypeRaw"){
      console.log("resultTypeRaw")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        result: "XPATH"
          });
        });
      })
    }

    if(e.target.id === "resultTypeVariables"){
      console.log("resultTypeVariables")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        result: "VAR"
          });
        });
      })
    }

    if(e.target.id === "resultTypePom"){
      console.log("resultTypePom")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        result: "POM"
          });
        });
      })
    }

    if(e.target.id === "programLanguageJava"){
      console.log("programLanguageJava")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        language: "JAVA"
          });
        });
      })
    }
    if(e.target.id === "programLanguagePython"){
      console.log("programLanguagePython")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        language: "PYTHON"
          });
        });
      })
    }

    if(e.target.id === "programLanguageCSharp"){
      console.log("programLanguageCSharp")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        language: "C#"
          });
        });
      })
    }
    if(e.target.id === "programLanguagePHP"){
      console.log("programLanguagePHP")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        language: "PHP"
          });
        });
      })
    }
    if(e.target.id === "programLanguagePerl"){
      console.log("programLanguagePerl")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        language: "PERL"
          });
        });
      })
    }
    if(e.target.id === "programLanguageRuby"){
      console.log("programLanguageRuby")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
        command: "changeDownload",
        language: "RUBY"
          });
        });
      })
    }
    
    if(e.target.id === "saveToFileButton"){
      console.log("saveToFileButton")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
            command: "saveToFile"
          });
        });
      })
    }
    if(e.target.id === "copyToClipBoardButton"){
      console.log("copyToClipBoardButton")
      browserAppData.tabs.query({ active: true, currentWindow: true }, function(result){
        result.forEach(function(tab) {
          browserAppData.tabs.sendMessage(tab.id, {
            command: "copyToClipBoard"
          });
        });
      })
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
  browserAppData.tabs.executeScript({ file: "/lib/popper.min.js" })
}

function startBootStrap(){
browserAppData.tabs.executeScript({ file: "/lib/bootstrap-4.4.1-dist/js/bootstrap.min.js" })
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browserAppData.tabs.executeScript({ file: "/lib/FileSaver.js" })
browserAppData.tabs.executeScript({ file: "/lib/jquery-3.4.1.min.js" })
startPopper()
startBootStrap()
browserAppData.tabs.executeScript({ file: "/content_scripts/main.js" })
browserAppData.tabs.executeScript({ file: "/content_scripts/select.js" })
listenForClicks()


