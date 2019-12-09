(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  
  let xpathArray = new Array();

  function selectMode() {
    console.log("SELECT MODE")
    document.addEventListener("click", e => {
      console.log("stop this click -> ",e)
      e.preventDefault();
      e.stopImmediatePropagation();
    })
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
    
    return validateXpathData(dataArray, clickedElement.nodeName);
  }
  
  /**
   * @param {*} dataArray 
   * @param {*} elementType 
   * 
   * Called by getByData() in order to validate xpaths.
   */
  function validateXpathData(dataArray, elementType) {
      dataArray.forEach(att =>{
          let xpath = "//" + elementType + "[@" + att.attribute + " = \'" + att.value + "\']";
          
          let results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  
          if(results.snapshotLength === 1) {
              xpathArray.push(xpath);
          }
      });
      
      return xpathArray;
  }

  function generateCode(language) {
    let javaCodeArray = new Array();
    xpathArray.forEach(xpath =>{
      let code = generateCodeByLanguage(language, xpath);
      javaCodeArray.push(code);
    });
    console.log(javaCodeArray);
    return javaCodeArray;
  }

  function generateCodeByLanguage(language, xpath) {
      switch(language) {
          case ("JAVA"): 
              return "driver.findElement(By.xpath(\"" + xpath + "\"));";
          case ("C#"): 
              return "driver.findElement(By.xpath(\"" + xpath + "\"));";
          case "PERL":
              return "$driver->find_element(\'" + xpath + "\');";
          case "PHP":
              return "$driver->findElement(WebDriverBy::xpath(\'" + xpath + "\'));";
          case "PYTHON":
              return "driver.find_element_by_xpath(\"" + xpath + "\")";
          case "RUBY":
              return "@driver.find_element(:xpath,\"" + xpath + "\")"
      }
  }


})();
