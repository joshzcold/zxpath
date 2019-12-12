(function () {
    function handleResponse(message) {
        console.log("message received in element.js");
    }
    
    function handleError(error) {
        console.log("error message sending in element.js");
    }
    
    document.addEventListener("click", (e) => {
        console.log("HELLO, inside of click event listener of element.js")
        let response = browser.runtime.sendMessage({
            content: "message originating from element.js",
            command: "elementCommand"
        });
    
        response.then(handleResponse, handleError);
    });
    })();