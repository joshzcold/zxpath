(function () {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  let xpathObjects = new Array();

  let downloadOptions = {
    downloadType: "raw",
    language: "JAVA"
  };

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
    console.log(xpathObjects);
    notifyBackgroundPage();
  }

  function getReducedString(acc, xpath) {
    console.log("Getting the xpaths passed to reduce");
    let language = downloadOptions.language
    return acc + getWebElements(language, xpath.topXpath, xpath.name) + " \n";
  }

  function settingsNewPage() {
    console.log("SETTINGS PAGE");
  }

  /**
   * Get valid xpaths and put them into popups
   * The main function of this extension
   * @param {*} message
   */
  function executeGetXpath(message) {
    let element = elementFromCord(message.element.X, message.element.Y);
    console.log("this is element outside of the promise", element);

    // place popup in dom
    let result = getXpathData(element);
    placePopup(element, message.element.X, message.element.Y, result.id);
  }

  /**
   * either save the results to a file for download
   * or send the results to a new raw page
   */
  function saveResultToFile() {
    if (downloadOptions.downloadType === "raw") {
      openNewPageWithRawResults()
    } else{
      let fileformatter = xpathObjects.reduce(getReducedString, "");
      var blob = new Blob([fileformatter], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "page-results.txt");
    }
  }

  /**
   * copy results to clipboard 
   */
  function copyResultToClipBoard(){
    let fileformatter = xpathObjects.reduce(getReducedString, "");
    navigator.clipboard.writeText(fileformatter)
    .then(() => {
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      // This can happen if the user denies clipboard permissions:
      console.error('Could not copy text: ', err);
    });
  }

  /**
   * open a new blank page with just text of the results 
   * so users can just copy and paste what they want
   */
  function openNewPageWithRawResults() {
    console.log("open new page with raw results")
    // window.open('_blank');
  }


  /**
   * Listening for main toolbar button presses
   */
  browser.runtime.onMessage.addListener(message => {
    if (message.command === "download") {
      downloadPopup();
    } else if (message.command === "settings") {
      settingsNewPage();
    } else if (message.command === "getXpath") {
      executeGetXpath(message);
    } else if (message.command === "elementCommand") {
      console.log("HELLO, inside of elementCommand in main.js");
      console.log(message.content);
    } else if (message.command === "changeDownload") {
      console.log("downloadOptions before change -> ", downloadOptions);
      console.log("changeDownload Message from toolbar ->", message);
      if (message.language !== undefined) {
        downloadOptions.language = message.language;
      }
      if (message.downloadType !== undefined) {
        downloadOptions.downloadType = message.downloadType;
      }
      console.log("downloadOptions after change -> ", downloadOptions);
    } else if (message.command === "saveToFile") {
      console.log("saveToFile Message from toolbar ->", message);
      saveResultToFile()
    } else if (message.command === "copyToClipBoard") {
      console.log("copyToClipBoard Message from toolbar ->", message);
      copyResultToClipBoard()
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

  function placePopup(element, X, Y, id) {
    let newX = X + window.pageXOffset;
    let newY = Y + window.pageYOffset;
    let style = "position: absolute; left: " + newX + "px; top: " + newY + "px; background:white; width:auto; padding: 10px 10px 10px 10px; border-radius: 8px; box-shadow: 2px 2px 10px;";
    let html = "<form id='zxpath-popup'><input id='zxpath-popup-input'  zxpathid="+id+" placeholder= 'Enter Element Name'></input><br>" +
      "<p id='zxpath-popup-input'>Select Preffered Xpath</p>" +

      "<ol>";

      getXpathList(id).forEach(xpath => {
      html += "<li id='zxpath-popup-selection' zxpathid="+id+">" + xpath + "</li>";
      });

    html += "</ol>" +
      "</form>";

    var div = document.createElement("div");
    div.setAttribute("id", "zxpath-popup")
    div.innerHTML = html;
    div.style = style;

    document.getElementById("insertPopup").appendChild(div);
  }

  /**
   * General lick and input listeners for click and input
   */
  document.addEventListener("click", (e) => {
    if (e.target.id === "zxpath-popup-selection") {
      let zxpathID = e.target.getAttribute("zxpathid")
      console.log("this is the ID I got ->", zxpathID)
      console.log("tis is the xpath im going to replace -> ", e.target.innerText)
      swapPrimaryXpath(parseInt(zxpathID), e.target.innerText)
      console.log("xpathObjects after change -> ", xpathObjects)
    }
  })

  document.addEventListener("input", (e) => {
    if (e.target.id === "zxpath-popup-input") {
      let zxpathID = e.target.getAttribute("zxpathid")
      console.log("this is the ID I got ->", zxpathID)
      let inputName = e.target.value;
      setName(parseInt(zxpathID), inputName)
      console.log("xpathObjects after change -> ", xpathObjects)
    }
  })


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
        "//" + elementType.toLowerCase() + "[@" + att.attribute + " = '" + att.value + "']";

      let results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

      if (results.snapshotLength === 1) {
        xpathArray.push(xpath);
      }
    });

    let obj;
    let id = Math.floor(10000000 + Math.random() * 90000000);
    if (xpathArray.length === 0) {
      obj = {
        id: id,
        name: "Enter_Name",
        topXpath: "NO VALID XPATH",
        xpathList: xpathArray,
        elementType: elementType.toLowerCase()
      };
    } else {
      obj = {
        id: id,
        name: "Enter_Name",
        topXpath: xpathArray[0],
        xpathList: xpathArray,
        elementType: elementType.toLowerCase()
      };
    }

    xpathObjects.push(obj);
    console.log("validateXpathData -> xpathObjects: ", xpathObjects);
    return obj;
  }

  /****** Language Output ******/

  function generateWebElements(language, xpath) {
    let javaCodeArray = new Array();

    xpathObjects.forEach(obj => {
      let code = getWebElements(language, obj.topXpath, obj.name);
      javaCodeArray.push(code);
    });
    return javaCodeArray;
  }

  function getWebElements(language, xpath, name) {
    switch (language) {
      case "JAVA":
        return ('WebElement ' + name + ' = driver.findElement(By.xpath("' + xpath + '"));');
      case "C#":
        return ('IWebElement ' + name + ' = driver.findElement(By.xpath("' + xpath + '"));');
      case "PERL":
        return ('my $' + name + ' = $driver->find_element(\'' + xpath + '\');');
      case "PHP":
        return ('$' + name + ' = $driver->findElement(WebDriverBy::xpath(\'' + xpath + '\'));');
      case "PYTHON":
        return (name + ' = driver.find_element_by_xpath("' + xpath + '")');
      case "RUBY":
        return (name + ' = @driver.find_element(:xpath,"' + xpath + '")');
    }
  }

  function getJavaPOM(name) {

  }

  /***** Utility Functions ******/

  function swapPrimaryXpath(id, newXpath) {
    xpathObjects = xpathObjects.map(obj => {
      if (obj.id == id) {
        return { ...obj, topXpath: newXpath };
      } else {
        return obj;
      }
    });
  }

  function setName(id, newName) {
    xpathObjects = xpathObjects.map(obj => {
      if (obj.id === id) {
        return { ...obj, name: newName };
      }
      else {
        return obj
      }
    });
  }

  function deselectElement(id) {
    xpathObjects = xpathObjects.filter(obj => {
      return obj.id !== id;
    });
  }

  function getXpathList(id) {  
    console.log(xpathObjects);
    console.log(id);
    return xpathObjects.find(obj => obj.id === id).xpathList;
  }
})();
