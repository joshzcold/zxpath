(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  
  let xpathObjects = new Array();

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
  const acceptable = ['id', 'name', 'alt', 'value', 'title', 'src', 'background', 'cite', 'color', 'data', 'href', 'label', 'list', 'pattern', 'placeholder', 'poster', 'baseuri'];

  acceptable.forEach(att => {
      if (clickedElement.hasAttribute(att)) {
          dataArray.push({ attribute: att, value: clickedElement.getAttribute(att) });
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
  let xpathArray = new Array();
  dataArray.forEach(att => {
      let xpath = "//" + elementType + "[@" + att.attribute + " = \'" + att.value + "\']";

      let results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

      if (results.snapshotLength === 1) {
          xpathArray.push(xpath);
      }
  });

  let obj;
  if (xpathArray.length === 0) {
      obj = { "topXpath": "NO VALID XPATH", "xpathList": xpathArray };
  } else {
      obj = { "topXpath": xpathArray[0], "xpathList": xpathArray };
  }

  xpathObjects.push(obj);
  return obj;
}

/**
* @param {*} objectIndex This will be which 'object' or element the user wants to swap xpath's for.
* @param {*} xpathIndex The index of the newly selected object that needs to replace 'topXpath'
* 
* Change topXpath to the xpath the user would prefer.
*/
function swapPrimaryXpath(topXpath, newXpath) {
  xpathObjects = xpathObjects.map(obj =>{
      if(obj.topXpath == topXpath) {
          return {...obj, topXpath : newXpath}
      }
      else {
          return obj;
      }
  });
}

/**
* @param {*} index The index of the xpathObjects.
* 
* If a user decides they don't want an element they can deselect it and we stop worrying about it.
*/
function deselectElement(topXpath) {
  xpathObjects = xpathObjects.filter((obj) => {
          return obj.topXpath !== topXpath;
      });
}

function generateWebElements(language, xpath) {
  let javaCodeArray = new Array();
  let code = getWebElementsByLanguage(language, xpath);
  javaCodeArray.push(code);
  console.log(javaCodeArray);
  return javaCodeArray;
}

function getWebElementsByLanguage(language, xpath) {
  switch (language) {
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
          return "@driver.find_element(:xpath,\"" + xpath + "\")";
  }
}

})();
