(function () {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  let xpathObjects = new Array();

  let downloadOptions = {
    downloadType: "raw",
    language: "JAVA",
    result: "XPATH"
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
    return  acc + getWebElements(language, xpath.topXpath, xpath.name) + " \n"; 
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
    console.log("what is message at executeGetXpath: ", message)
    let element = elementFromCord(message.element.X, message.element.Y);

    // place popup in dom
    let result = getXpathData(element, message.element.selection);
    console.log("result after getXpathData", result)
    placePopup(element, message.element.X, message.element.Y, result.id, message);
  }

  function removeXpath(message){
    console.log("what is the message in removeXpath: ", message)
    // remove the read overlay on the element known as the "selection"
    let selectedSelector = document.querySelector(`#xpath-selections > [id='${message.element.selection}']`);
    selectedSelector.parentNode.removeChild(selectedSelector);

    // Remove the pop near the element 
    let selectedPopup = document.querySelector(`#insertPopup > [selection='${message.element.selection}']`);
    selectedPopup.parentNode.removeChild(selectedPopup);
    console.log("what is selectedPopup in removeXpath: ", selectedPopup)

    // Remove the actual data from xpathObjects 
    // this actually creates a new variable we will assign
    let filtered = xpathObjects.filter(function(value){
      return value.selectionID !== message.element.selection
    });
    // Assigning xpathObjects to new array
    xpathObjects = filtered
    console.log("xpathObjects after filter remove : ", xpathObjects)
  }

  /**
   * either save the results to a file for download
   * or send the results to a new raw page
   */
  function saveResultToFile() {
    let fileFormatter
    let resultOption = downloadOptions.result
    let language = downloadOptions.language
    console.log(downloadOptions)
    if(resultOption === "XPATH"){
      fileFormatter = getXpaths()
    } else if (resultOption === "VAR"){
      console.log("hellow orld")
      fileFormatter =  xpathObjects.reduce(getReducedString, "");
    } else if (resultOption === "POM"){
      if(language === "JAVA"){
        fileFormatter =  getJavaPOM() 
      } else{
        alert("language isn't supported for full POM yet")
      }
    }

    if (downloadOptions.downloadType === "raw") {
      openNewPageWithRawResults(fileFormatter)
    } else{
      var blob = new Blob([fileFormatter], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "page-results.txt");
    }
  }

  /**
   * copy results to clipboard 
   */
  function copyResultToClipBoard(){

    let fileFormatter
    let resultOption = downloadOptions.result
    let language = downloadOptions.language
    console.log(downloadOptions)
    if(resultOption === "XPATH"){
      fileFormatter = getXpaths()
    } else if (resultOption === "VAR"){
      fileFormatter =  xpathObjects.reduce(getReducedString, "");
    } else if (resultOption === "POM"){
      if(language === "JAVA"){
        console.log("hello world")
        fileFormatter =  getJavaPOM();
        console.log("hello world 2")
        console.log(fileFormatter)
      } else{
        alert("language isn't supported for full POM yet")
      }
    }

    navigator.clipboard.writeText(fileFormatter)
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
  function openNewPageWithRawResults(result) {
    alert(result)
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
    } else if (message.command === "removeXpath") {
      removeXpath(message);
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
      if (message.result !== undefined) {
        downloadOptions.result = message.result;
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
        console.log("X Y in elementFromCord", X, Y)
        element = document.elementFromPoint(X,Y);
        console.log("getXpath element:  ", element);
      } catch (error) {
        console.error(error);
      }
    }
    return element;
  }

  function placePopup(element, X, Y, id, message) {
    let newX = X + window.pageXOffset;
    let newY = Y + window.pageYOffset;
    console.log("what is element at placePopup?:", element)
    console.log("number of found xpaths for this element", getXpathList(id).length)
    if(getXpathList(id).length === 0){
      console.log("element is null not placing the popup")

      let html = `
      <div class="alert alert-warning"  id="no-zxpath-alert" role="alert">
        no xpath found
      </div>
      `
      var div = document.createElement("div");
      div.innerHTML = html;
      let style = "position: absolute; left: " + newX + "px; top: " + newY + "px; width:auto; z-index:999999;";
      div.style = style;
      div.setAttribute("id", "no-zxpath-alert-div")
      document.getElementById("insertPopup").appendChild(div);

      // Selecting the element in the dom so we can set zxpath to false
      // this makes the extension believe the element isn't in the selected state
      // when there is no valid xpath to store
      console.log("what is message.element.selection: ", message.element.selection)
      let selectedElement = document.querySelector(`[zxpath-id='${message.element.selection}']`);
      selectedElement.setAttribute("zxpath","false")
      console.log("what is selectedElement in placePopup? ", selectedElement)

      // have the alert fade away after being presented
      setTimeout(function(){$('.alert').fadeOut();}, 2000);

      // remove the red selection on the element because no xpaths were
      // found for the element
      let selectionsOverlay = document.getElementById("xpath-selections")
      let removeSelection = document.getElementById(message.element.selection)
      selectionsOverlay.removeChild(removeSelection)

    }else{
      // have to use browser api to get svg stored in web_acessible_resources
      let iconPath = browser.runtime.getURL("icons/popup_button.svg")
      let html = `
    <div class="dropdown" id="zxpath-popup" ">
        <button class="btn btn-secondary" type="button" id="zxpath-popup-icon" data-toggle="dropdown"
            aria-haspopup="true" aria-expanded="true">
          <img class="settings" id="zxpath-popup-icon-x" src="${iconPath}"></img>
        </button>


        <div id="zxpath-dropdown-tooltip" class="dropdown-menu" style="z-index: 9999999;"role="menu">
          <div id="zxpath-dropdown-container" class="zxpath-dropdown-menu" >
                <input id="zxpath-popup-input" zxpathid=${id} placeholder='Enter Element Name' class="zxpath-popup-input form-control form-control-sm" type="text" placeholder=".form-control-sm">
            <form class="list-group zxpath-list-group">
                ${getXpathList(id).map(xpath => `<a class="zxpath-list-group-item list-group-item list-group-item-action" id='zxpath-popup-selection' zxpathid=${id} data-toggle="list">${xpath}</a>`)}
            </form>

          </div>
        </div>
    </div>
    `

      let style = "position: absolute; left: " + newX + "px; top: " + newY + "px; width:auto; z-index:999999;";

      var div = document.createElement("div");
      div.setAttribute("id", "zxpath-popup")
      div.setAttribute("selection", message.element.selection)
      div.innerHTML = html;
      div.style = style;

      document.getElementById("insertPopup").appendChild(div);
    }
  }

  /**
   * General click and input listeners for click and input
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
      setName(zxpathID, inputName)
      console.log("xpathObjects after change -> ", xpathObjects)
    }
  })


  /**
   * @param {*} clickedElement
   *
   * Returns an array of valid Xpaths for the clickedElement
   */
  function getXpathData(element, selectionID) {

    let dataArray = new Array();
    const acceptable = [
      getXpathAttribute(element,"id"),
      getXpathAttribute(element,"name"),
      getXpathAttribute(element,"alt"),
      getXpathAttribute(element,"value"),
      getXpathAttribute(element,"title"),
      getXpathAttribute(element,"src"),
      getXpathAttribute(element,"background"),
      getXpathAttribute(element,"cite"),
      getXpathAttribute(element,"color"),
      getXpathAttribute(element,"data"),
      getXpathAttribute(element,"href"),
      getXpathAttribute(element,"label"),
      getXpathAttribute(element,"list"),
      getXpathAttribute(element,"pattern"),
      getXpathAttribute(element,"placeholder"),
      getXpathAttribute(element,"poster"),
      getXpathAttribute(element,"baseuri")
    ];

    acceptable.forEach(value => {
      console.log("value from accptable array",value)
      dataArray.push(value);
    });

    return validateXpathData(dataArray, element.nodeName, selectionID);
  }

  function getXpathAttribute(element, attribute){
    // getAttribute is best effort and will return null, but thats okay because we will 
    // validate it in a later function called validateXpathData
    let value = element.getAttribute(attribute)
      let xpath =
        "//" + element.nodeName.toLowerCase() + "[@" + attribute + " = '" + value + "']";
    return xpath
  }

  /**
   * @param {*} dataArray
   * @param {*} elementType
   *
   * Called by getByData() in order to validate xpaths.
   */
  function validateXpathData(dataArray, elementType, selectionID) {
    let xpathArray = new Array();
    dataArray.forEach(xpath => {

      let results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

      if (results.snapshotLength === 1) {
        xpathArray.push(xpath);
      }
    });

    let obj;
    let id = uuidv4()

    console.log("what is the xpath object id?: ", id)

    if (xpathArray.length === 0) {
      obj = {
        id: id,
        name: "Enter_Name",
        topXpath: "NO VALID XPATH",
        xpathList: xpathArray,
        elementType: elementType.toLowerCase(),
        selectionID: selectionID
      };
    } else {
      obj = {
        id: id,
        name: "Enter_Name",
        topXpath: xpathArray[0],
        xpathList: xpathArray,
        elementType: elementType.toLowerCase(),
        selectionID: selectionID
      };
      xpathObjects.push(obj);
    }

    console.log("validateXpathData -> xpathObjects: ", xpathObjects);
    return obj;
  }

  /****** Language Output ******/

  function getXpaths() {
    let values = xpathObjects.map(obj => obj.topXpath);
    return values.join('\n')
  }

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  function generateWebElements(language) {
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

  function getJavaPOM() {
    let pom = "private class ClassName {\n\n" +

    "  /* Element Variables */ \n";
    generateWebElements("JAVA").forEach(element => {
      pom += "  " + element + "\n";
    });

    pom += "\n  /* Function Calls */ \n";

    xpathObjects.forEach(obj => {
      if(obj.elementType === "button" || obj.elementType === "a") {
        pom+= "  private void click" + obj.name + "Button() {\n" +
        "  " + obj.name + ".click();\n" +
        "  }\n\n"
      }

      else if(obj.elementType === "input") {
        pom+= "  private void set" + obj.name + "Field(String value) {\n" +
        "  " + obj.name + ".clear();\n" +
        "  " + obj.name + ".sendKeys(value);\n" +
        "  }\n\n"
      }
    });

    pom += "}";

    return pom
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

  function getXpathList(id) {  
    let result = xpathObjects.find(obj => obj.id === id)
    if(result === undefined){
      result = {
        xpathList: []
      }
    }
    return result.xpathList 
  }
})();
