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
      let xpath = "//" + elementType + "[@" + att.attribute + " = '" + att.value + "']";

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
        elementType: elementType
      };
    } else {
      obj = {
        id: id,
        name: "Enter_Name",
        ttopXpath: xpathArray[0],
        xpathList: xpathArray,
        elementType: elementType
      };
    }

    xpathObjects.push(obj);
    return obj;
  }