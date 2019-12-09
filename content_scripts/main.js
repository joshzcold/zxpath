(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function selectMode() {
    console.log("SELECT MODE")
  }

  function downloadPopup() {
    console.log("DOWNLOAD POPUP")
  }

  function settingsNewPage() {
    console.log("SETTINGS PAGE")
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "select") {
      selectMode();
    } else if (message.command === "download"){
      downloadPopup()
    } else if (message.command === "settings"){
      settingsNewPage()
    }
  });

})();