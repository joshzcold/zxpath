(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function insertBeast(beastURL) {
    /*
    EXECUTE STUFF HERE YAH DUMMY!!!
    */
    console.log("DUUUUUUDDDDDEEE!")
  }



  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "beastify") {
      insertBeast(message.beastURL);
    } 
  });

})();