function listenForClicks() {
  document.addEventListener("click", (e) => {

    function selectorMode(tabs) {
      console.log("entering selector mode")
    }

    function openSettings(){
      console.log("opening settings page")
    }

    function openSave(){
      console.log("opening save popup")
    }

    if (e.target.classList.contains("select")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(selectorMode)
        .catch(reportError);
    }
    else if (e.target.classList.contains("list")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(openSave)
        .catch(reportError);
    }
    else if (e.target.classList.contains("settings")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(openSettings)
        .catch(reportError);
    } 
    else {
      console.error("not a valid button selection")
    }
  });
}

function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

browser.tabs.executeScript({file: "/content_scripts/main.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
