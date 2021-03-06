

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/* globals chrome */
var xPathFinder =
  xPathFinder ||
  (() => {
    class Inspector {
      constructor() {
        this.win = window;
        this.doc = window.document;

        this.draw = this.draw.bind(this);
        this.getData = this.getData.bind(this);
        this.setOptions = this.setOptions.bind(this);

        this.cssNode = "xpath-css";
        this.contentNode = "xpath-content";
        this.overlayElement = "xpath-overlay";
        this.overlaySelection = "xpath-selections"
      }

      getData(e){
        // TODO handle absolute positioning with scroll offset 
        if(!e.target.id.includes("zxpath")){
        e.stopImmediatePropagation();
        e.preventDefault && e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        }
        let handleResponse = message => {
          console.log(
            `Message from the background script:  ${message.response}`
          );
        };

        let handleError = error => {
          console.log(`Error: ${error}`);
        };



        if (e.target.id !== this.contentNode) {
          console.log("you clicked on -> ", e);
          if (e.target.getAttribute("zxpath") === "true") {
            // REMOVE FROM SELECTION
            // //////////////////////
            let selectionID = e.target.getAttribute("zxpath-id")
            console.log("i found this zxpathid from the element: ", selectionID)
            let removeElement = chrome.runtime.sendMessage({
              X: e.x,
              Y: e.y,
              command: "removeXpath",
              selection: selectionID
            });

            console.log("removing element from Xpath")
            e.target.setAttribute("zxpath", "false");
            // remove element from global
            removeElement.then(handleResponse, handleError);
          } else {
            // ADD TO SELECTION
            // ///////////////////////

            // Don't place the popup if element is a zxpath element
            if(!e.target.id.includes("zxpath")){

              let selectionID = uuidv4()
              this.setSelection(e, selectionID)
              console.log("this is selectionID: ", selectionID)
              // send message to background.js to place popup and get data
              let sendElement = chrome.runtime.sendMessage({
                X: e.x,
                Y: e.y,
                command: "getXpath",
                selection: selectionID
              });

              console.log("sending element to getXpath")
              e.target.setAttribute("zxpath", "true");
              e.target.setAttribute("zxpath-id", selectionID)
              // Add element to global
              sendElement.then(handleResponse, handleError);
            }
          }
        }
      }

      setSelection(e, selectionID){
        const node = e.target;
        console.log("does node.id include zxpath?: ", node.id.includes("zxpath"))

        if (node.id !== this.selectionNode && node.id 
          !== this.contentNode && !node.id.includes("zxpath")) {
          const box = this.getNestedBoundingClientRect(node, this.win);
          const dimensions = this.getElementDimensions(node);

          const overlayStyles = {
            background: "rgba(255, 170, 170, 0.7)",
            padding: "rgba(255, 170, 170, 0.7)",
            margin: "rgba(255, 170, 170, 0.7)",
            border: "rgba(255, 170, 170, 0.7)"
          };

          let selectionNode = this.doc.createElement("div")
          let selectionBorder = this.doc.createElement("div")
          let selectionPadding = this.doc.createElement("div")
          let selectionContent = this.doc.createElement("div")

          selectionBorder.style.borderColor = overlayStyles.border
          selectionPadding.style.borderColor = overlayStyles.padding
          selectionContent.style.backgroundColor = overlayStyles.background
          Object.assign(selectionNode.style, {
            borderColor: overlayStyles.margin,
            pointerEvents: "none",
            position: "absolute"
          });

          this.boxWrap(dimensions, "margin", selectionNode);
          this.boxWrap(dimensions, "border", selectionBorder);
          this.boxWrap(dimensions, "padding", selectionPadding);

          Object.assign(selectionContent.style, {
            height:
            box.height -
            dimensions.borderTop -
            dimensions.borderBottom -
            dimensions.paddingTop -
            dimensions.paddingBottom +
            "px",
            width:
            box.width -
            dimensions.borderLeft -
            dimensions.borderRight -
            dimensions.paddingLeft -
            dimensions.paddingRight +
            "px"
          });

          Object.assign(selectionNode.style, {
            top: box.top - dimensions.marginTop + window.pageYOffset + "px",
            left: box.left - dimensions.marginLeft + window.pageXOffset + "px"
          });


          selectionNode.id = selectionID
          selectionNode.style.zIndex = 999998

          console.log("what is slection.id", selectionNode.id)

          this.selection.appendChild(selectionNode);
          selectionNode.appendChild(selectionBorder);
          selectionBorder.appendChild(selectionPadding);
          selectionPadding.appendChild(selectionContent);
        }
      }

      getOptions() {
        const storage = chrome.storage && chrome.storage.local;
        const promise = storage.get(
          {
            inspector: true,
            clipboard: true,
            shortid: true,
            position: "bl"
          },
          this.setOptions
        );
        promise && promise.then && promise.then(this.setOptions());
      }

      setOptions(options) {
        this.options = options;
        let position = "bottom:0;left:0";
        switch (options.position) {
          case "tl":
            position = "top:0;left:0";
            break;
          case "tr":
            position = "top:0;right:0";
            break;
          case "br":
            position = "bottom:0;right:0";
            break;
          default:
            break;
        }
        this.styles = `*{cursor:crosshair!important;}#xpath-content{${position};cursor:initial!important;padding:10px;background:gray;color:white;position:fixed;font-size:14px;z-index:10000001;}`;
        this.activate();
      }

      createOverlayElements() {
        const overlayStyles = {
          background: "rgba(120, 170, 210, 0.7)",
          padding: "rgba(77, 200, 0, 0.3)",
          margin: "rgba(255, 155, 0, 0.3)",
          border: "rgba(255, 200, 50, 0.3)"
        };

        this.popups = this.doc.createElement("div");
        this.container = this.doc.createElement("div");
        this.selection = this.doc.createElement("div");
        this.node = this.doc.createElement("div");
        this.border = this.doc.createElement("div");
        this.padding = this.doc.createElement("div");
        this.content = this.doc.createElement("div");

        this.border.style.borderColor = overlayStyles.border;
        this.padding.style.borderColor = overlayStyles.padding;
        this.content.style.backgroundColor = overlayStyles.background;

        Object.assign(this.node.style, {
          borderColor: overlayStyles.margin,
          pointerEvents: "none",
          position: "fixed"
        });

        this.selection.id = this.overlaySelection;
        this.container.id = this.overlayElement;
        this.popups.id = "insertPopup";
        this.selection.style.zIndex = 10000001;
        this.container.style.zIndex = 10000000;
        this.node.style.zIndex = 10000000;

      let iconPath = chrome.runtime.getURL("icons/close.svg")
        let closeSelectorButton = `
          <div class="zxpath-close-selector" id="zxpath-close-selector-div">
          <button type="button" class="btn-danger zxpath-close-selector-button" id="zxpath-close-selector-button">
          <p class="zxpath-close-selector-text" id="zxpath-close-selector-text">Close Selector</p>
          <img class="zxpath-close-icon" id="zxpath-close-selector-icon" src="${iconPath}"></img>
          </button>
          </div>
        `
      var closeSelector = document.createElement("div");
      closeSelector.setAttribute("id", "zxpath-close-selector")
      closeSelector.innerHTML = closeSelectorButton;

        this.selection.appendChild(this.node);
        this.container.appendChild(this.node);
        this.container.appendChild(closeSelector);
        this.node.appendChild(this.border);
        this.border.appendChild(this.padding);
        this.padding.appendChild(this.content);
        this.doc.body.appendChild(this.selection);
        this.doc.body.appendChild(this.container);
        this.doc.body.appendChild(this.popups);
      }

      removeOverlay() {
        const overlayHtml = document.getElementById(this.overlayElement);
        overlayHtml && overlayHtml.remove();
      }

      copyText(XPath) {
        const hdInp = document.createElement("textarea");
        hdInp.textContent = XPath;
        document.body.appendChild(hdInp);
        hdInp.select();
        document.execCommand("copy");
        hdInp.remove();
      }

      draw(e) {
        const node = e.target;
        if (node.id !== this.selectionNode && node.id 
          !== this.contentNode && !node.id.includes("zxpath") ) {
          this.removeOverlay();

          const box = this.getNestedBoundingClientRect(node, this.win);
          const dimensions = this.getElementDimensions(node);

          this.boxWrap(dimensions, "margin", this.node);
          this.boxWrap(dimensions, "border", this.border);
          this.boxWrap(dimensions, "padding", this.padding);

          Object.assign(this.content.style, {
            height:
            box.height -
            dimensions.borderTop -
            dimensions.borderBottom -
            dimensions.paddingTop -
            dimensions.paddingBottom +
            "px",
            width:
            box.width -
            dimensions.borderLeft -
            dimensions.borderRight -
            dimensions.paddingLeft -
            dimensions.paddingRight +
            "px"
          });

          Object.assign(this.node.style, {
            top: box.top - dimensions.marginTop + "px",
            left: box.left - dimensions.marginLeft + "px"
          });

          this.doc.body.appendChild(this.container);
        }
      }

      activate() {
        this.createOverlayElements();
        // add styles
        if (!document.getElementById(this.cssNode)) {
          const styles = document.createElement("style");
          styles.innerText = this.styles;
          styles.id = this.cssNode;
          document.getElementsByTagName("head")[0].appendChild(styles);
        }
        // add listeners
        document.addEventListener("click", this.getData, true);
        this.options.inspector &&
          document.addEventListener("mouseover", this.draw);
      }

      deactivate() {
        // remove styles
        const cssNode = document.getElementById(this.cssNode);
        cssNode && cssNode.remove();
        // remove overlay
        this.removeOverlay();
        // remove xpath html
        const contentNode = document.getElementById(this.contentNode);
        contentNode && contentNode.remove();
        // remove listeners
        document.removeEventListener("click", this.getData, true);
        this.options &&
          this.options.inspector &&
          document.removeEventListener("mouseover", this.draw);
      }

      getXPath(el) {
        let nodeElem = el;
        if (nodeElem.id && this.options.shortid) {
          return `//*[@id="${nodeElem.id}"]`;
        }
        const parts = [];
        while (nodeElem && nodeElem.nodeType === Node.ELEMENT_NODE) {
          let nbOfPreviousSiblings = 0;
          let hasNextSiblings = false;
          let sibling = nodeElem.previousSibling;
          while (sibling) {
            if (
              sibling.nodeType !== Node.DOCUMENT_TYPE_NODE &&
              sibling.nodeName === nodeElem.nodeName
            ) {
              nbOfPreviousSiblings++;
            }
            sibling = sibling.previousSibling;
          }
          sibling = nodeElem.nextSibling;
          while (sibling) {
            if (sibling.nodeName === nodeElem.nodeName) {
              hasNextSiblings = true;
              break;
            }
            sibling = sibling.nextSibling;
          }
          const prefix = nodeElem.prefix ? nodeElem.prefix + ":" : "";
          const nth =
            nbOfPreviousSiblings || hasNextSiblings
            ? `[${nbOfPreviousSiblings + 1}]`
            : "";
          parts.push(prefix + nodeElem.localName + nth);
          nodeElem = nodeElem.parentNode;
        }
        return parts.length ? "/" + parts.reverse().join("/") : "";
      }

      getElementDimensions(domElement) {
        const calculatedStyle = window.getComputedStyle(domElement);
        return {
          borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
          borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
          borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
          borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
          marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
          marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
          marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
          marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
          paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
          paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
          paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
          paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
        };
      }

      getOwnerWindow(node) {
        if (!node.ownerDocument) {
          return null;
        }
        return node.ownerDocument.defaultView;
      }

      getOwnerIframe(node) {
        const nodeWindow = this.getOwnerWindow(node);
        if (nodeWindow) {
          return nodeWindow.frameElement;
        }
        return null;
      }

      getBoundingClientRectWithBorderOffset(node) {
        const dimensions = this.getElementDimensions(node);
        return this.mergeRectOffsets([
          node.getBoundingClientRect(),
          {
            top: dimensions.borderTop,
            left: dimensions.borderLeft,
            bottom: dimensions.borderBottom,
            right: dimensions.borderRight,
            width: 0,
            height: 0
          }
        ]);
      }

      mergeRectOffsets(rects) {
        return rects.reduce((previousRect, rect) => {
          if (previousRect === null) {
            return rect;
          }
          return {
            top: previousRect.top + rect.top,
            left: previousRect.left + rect.left,
            width: previousRect.width,
            height: previousRect.height,
            bottom: previousRect.bottom + rect.bottom,
            right: previousRect.right + rect.right
          };
        });
      }

      getNestedBoundingClientRect(node, boundaryWindow) {
        const ownerIframe = this.getOwnerIframe(node);
        if (ownerIframe && ownerIframe !== boundaryWindow) {
          const rects = [node.getBoundingClientRect()];
          let currentIframe = ownerIframe;
          let onlyOneMore = false;
          while (currentIframe) {
            const rect = this.getBoundingClientRectWithBorderOffset(
              currentIframe
            );
            rects.push(rect);
            currentIframe = this.getOwnerIframe(currentIframe);
            if (onlyOneMore) {
              break;
            }
            if (
              currentIframe &&
              this.getOwnerWindow(currentIframe) === boundaryWindow
            ) {
              onlyOneMore = true;
            }
          }
          return this.mergeRectOffsets(rects);
        }
        return node.getBoundingClientRect();
      }

      boxWrap(dimensions, parameter, node) {
        Object.assign(node.style, {
          borderTopWidth: dimensions[parameter + "Top"] + "px",
          borderLeftWidth: dimensions[parameter + "Left"] + "px",
          borderRightWidth: dimensions[parameter + "Right"] + "px",
          borderBottomWidth: dimensions[parameter + "Bottom"] + "px",
          borderStyle: "solid"
        });
      }
    }

    const inspect = new Inspector();

    chrome.runtime.onMessage.addListener(request => {
      if (request.command === "select") {
        return inspect.getOptions();
      }
    });

    document.onkeydown = function(evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        console.log("Escape key pressed deactivating select mode")
        inspect.deactivate();
      }
    };

    document.addEventListener("click", (e) => {
      if (e.target.id.includes("zxpath-close-selector")) {
      inspect.deactivate();
    }
  })
    return true;
  })();
