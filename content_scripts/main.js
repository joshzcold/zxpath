(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  let xpathObjects = new Array();
  let languageChoice = "JAVA";

  function handleResponse(message) {
    console.log(`Message from the background script:  ${message.response}`);
  }

  function handleError(error) {
    console.log(`Error: ${error}`);
  }

  function notifyBackgroundPage() {
    var sending = browser.runtime.sendMessage({
      greeting: "Greeting from the content script"
    });
    sending.then(handleResponse, handleError);
  }

  function downloadPopup() {
    let fileformatter = xpathObjects.reduce(getReducedString, "");
    console.log(fileformatter);
    // FileSaver
    notifyBackgroundPage();
  }

  function getReducedString(acc, xpath) {
    return acc + getWebElementsByLanguage(languageChoice, xpath.topXpath) + " \n";
  }

  function settingsNewPage() {
    console.log("SETTINGS PAGE");
  }

  browser.runtime.onMessage.addListener(message => {
    if (message.command === "download") {
      downloadPopup();
    } else if (message.command === "settings") {
      settingsNewPage();
    } else if (message.command === "getXpath") {
     let element = elementFromCord(message.element.X, message.element.Y);
      console.log("this is element outside of the promise", element);
      // place popup in dom
      placePopup(element)
        
      // async call to get selector data
      var promise = new Promise(function(resolve, reject) {
        console.log(
            "Sending this to getXpathData " + element
          );
        let result = getXpathData(element);
        if (result !== null) {
          resolve( result);
        } else {
          reject(Error(result));
        }
      });
      // populate the popup with data
      populatePopup(promise);
    }
  });

  function elementFromCord(X,Y){
    let element;
    if (typeof X === "number" && typeof Y === "number") {
      try {
        element = document.elementFromPoint(
          X - window.pageXOffset,
          Y - window.pageYOffset
        );
        console.log("getXpath element:  ", element);
      } catch (error) {
        console.error(error);
      }
    }
    return element;
  }

  function placePopup(element){
    /**
         * REED PLACE POPUP IN DOM HERE 
         */
  }

  function populatePopup(xpathDataPromise) {
    console.log("placeZXPathPopup -> xpathDataPromise", xpathDataPromise);
    xpathDataPromise.then(
      function(result) {
        console.log("result ->", result); // populate the popup
        /**
         * REED POPULATE WITH DATA HERE 😤
         */
      },
      function(err) {
        console.log(err); // Error: "It broke"
      }
    );
  }

  /**
   * @param {*} clickedElement
   *
   * Returns an array of valid Xpaths for the clickedElement
   */
  function getXpathData(element) {

    let dataArray = new Array();
    const acceptable = [
      "id",
      "name",
      "alt",
      "value",
      "title",
      "src",
      "background",
      "cite",
      "color",
      "data",
      "href",
      "label",
      "list",
      "pattern",
      "placeholder",
      "poster",
      "baseuri"
    ];

    acceptable.forEach(att => {
      if (element.hasAttribute(att)) {
        dataArray.push({ attribute: att, value: element.getAttribute(att) });
      }
    });

    return validateXpathData(dataArray, element.nodeName);
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
      let xpath =
        "//" + elementType + "[@" + att.attribute + " = '" + att.value + "']";

      let results = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      if (results.snapshotLength === 1) {
        xpathArray.push(xpath);
      }
    });

    let obj;
    if (xpathArray.length === 0) {
      obj = { topXpath: "NO VALID XPATH", xpathList: xpathArray };
    } else {
      obj = { topXpath: xpathArray[0], xpathList: xpathArray };
    }

    xpathObjects.push(obj);
    console.log("validateXpathData -> xpathObjects: ", xpathObjects);
    return obj;
  }

  /**
   * @param {*} objectIndex This will be which 'object' or element the user wants to swap xpath's for.
   * @param {*} xpathIndex The index of the newly selected object that needs to replace 'topXpath'
   *
   * Change topXpath to the xpath the user would prefer.
   */
  function swapPrimaryXpath(topXpath, newXpath) {
    xpathObjects = xpathObjects.map(obj => {
      if (obj.topXpath == topXpath) {
        return { ...obj, topXpath: newXpath };
      } else {
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
    xpathObjects = xpathObjects.filter(obj => {
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
      case "JAVA":
        return 'driver.findElement(By.xpath("' + xpath + '"));';
      case "C#":
        return 'driver.findElement(By.xpath("' + xpath + '"));';
      case "PERL":
        return "$driver->find_element('" + xpath + "');";
      case "PHP":
        return "$driver->findElement(WebDriverBy::xpath('" + xpath + "'));";
      case "PYTHON":
        return 'driver.find_element_by_xpath("' + xpath + '")';
      case "RUBY":
        return '@driver.find_element(:xpath,"' + xpath + '")';
    }
  }
})();
