(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  /**
   * Given a URL to a beast image, remove all existing beasts, then
   * create and style an IMG node pointing to
   * that image, then insert the node into the document.
   */
  function insertBeast(beastURL) {
    removeExistingBeasts();
    let beastImage = document.createElement("img");
    beastImage.setAttribute("src", beastURL);
    beastImage.style.height = "100vh";
    beastImage.className = "beastify-image";
    document.body.appendChild(beastImage);
  }

  /**
   * Remove every beast from the page.
   */
  function removeExistingBeasts() {
    let existingBeasts = document.querySelectorAll(".beastify-image");
    for (let beast of existingBeasts) {
      beast.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "beastify()" or "reset()".
  */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "beastify") {
      insertBeast(message.beastURL);
    } else if (message.command === "reset") {
      removeExistingBeasts();
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
