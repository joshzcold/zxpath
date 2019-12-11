(function() {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  let xpathObjects = new Array();

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
    console.log("DOWNLOAD POPUP");


    // let url = browser.runtime.getURL("popup/output-popup.html")
    // console.log(url)

    // let iframe = document.createElement("iframe")
    // iframe.setAttribute("src", url)
    // iframe.setAttribute("id", ".download_modal")
    // document.body.appendChild(iframe)

    notifyBackgroundPage();
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
      placePopup(element, message.element.X, message.element.Y);

      // async call to get selector data
      var promise = new Promise(function(resolve, reject) {
        let result = getXpathData(element);
        if (result !== null) {
          resolve(result);
        } else {
          reject(Error(result));
        }
      });
      // populate the popup with data
      populatePopup(promise);
    }
  });

  function elementFromCord(X, Y) {
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

  function placePopup(element, X, Y) {
    let newX = X + window.pageXOffset;
    let newY = Y + window.pageYOffset;
    let style = "position: absolute; left: " + newX + "px; top: " + newY + "px; background:none transparent; width:auto;";

    let url = browser.runtime.getURL("element-popout/element.html");
    let iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    iframe.setAttribute("style", style);
    iframe.setAttribute("allowtransparency", "true")
    iframe.setAttribute("frameBorder", "0")
    iframe.setAttribute("scrolling", "no")
    iframe.setAttribute("id", "zxpath-iframe")


    var div = document.createElement("div");
    
    document.getElementById("insertPopup").appendChild(iframe);
  }

  function populatePopup(xpathDataPromise) {
    console.log("placeZXPathPopup -> xpathDataPromise", xpathDataPromise);
    xpathDataPromise.then(
      function(result) {
        console.log("result ->", result); // populate the popup
        /**
         * REED POPULATE WITH DATA HERE
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
      obj = {topXpath: "NO VALID XPATH", xpathList: xpathArray, elementType: elementType};
    } else {
      obj = {topXpath: xpathArray[0], xpathList: xpathArray, elementType: elementType};
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

  function getXpaths() {
    return xpathObjects.map(obj => obj.topXpath);
  }

  function generateWebElements(language) {
    let javaCodeArray = new Array();

    xpathObjects.map(obj => obj.topXpath).forEach(att =>{
      let code = getWebElements(language, att);
      javaCodeArray.push(code);
    });
    return javaCodeArray;
  }

  function getWebElements(language, xpath) {
    switch (language) {
      case "JAVA":
        return 'WebElement <REPLACE_NAME> = driver.findElement(By.xpath("' + xpath + '"));';
      case "C#":
        return 'IWebElement <REPLACE_NAME>> = driver.findElement(By.xpath("' + xpath + '"));';
      case "PERL":
        return "my $<REPLACE_NAME>> = $driver->find_element('" + xpath + "');";
      case "PHP":
        return "$<REPLACE_NAME>> = $driver->findElement(WebDriverBy::xpath('" + xpath + "'));";
      case "PYTHON":
        return '<REPLACE_NAME>> = driver.find_element_by_xpath("' + xpath + '")';
      case "RUBY":
        return '<REPLACE_NAME>> = @driver.find_element(:xpath,"' + xpath + '")';
    }
  }
})();
