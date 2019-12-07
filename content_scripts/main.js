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
  
    /**
   * @param {*} clickedElement 
   * 
   * Returns an array of valid Xpaths for the clickedElement
   */
  function getXpathData(clickedElement) {
    let dataArray = new Array();
    const acceptable = ['id', 'name', 'alt', 'value', 'title', 'src', 'background', 'cite', 'color', 'data', 'href', 'label', 'list', 'pattern', 'placeholder', 'poster'];
  
    acceptable.forEach(att => {
      if(clickedElement.hasAttribute(att)) {
          dataArray.push({attribute : att, value : clickedElement.getAttribute(att)});
       }
    });
    
    return validateByData(dataArray, element.nodeName);
  }
  
  /**
   * @param {*} dataArray 
   * @param {*} elementType 
   * 
   * Called by getByData() in order to validate xpaths.
   */
  function validateXpathData(dataArray, elementType) {
      let xpathArray = new Array();
      dataArray.forEach(att =>{
          let xpath = "//" + elementType + "[@" + att.attribute + " = \'" + att.value + "\']";
          
          let results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  
          if(results.snapshotLength === 1) {
              xpathArray.push(xpath);
          }
      });
      
      return xpathArray;
  }

})();
