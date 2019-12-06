
function popupActions(){

  console.log("Hello World")

  document.getElementById("zxpath-select-button").addEventListener("click", function(){
    console.log("entering selector mode")
  }); 
  
  document.getElementById("zxpath-download-button").addEventListener("click", function(){
    console.log("opening save popup")
  }); 
  
  document.getElementById("zxpath-settings-button").addEventListener("click", function(){
    console.log("opening settings page")
  }); 
}

function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute: ${error.message}`);
}

browser.tabs.executeScript({file: "/content_scripts/main.js"})
.then(popupActions)
.catch(reportExecuteScriptError);
