(function () {


    function handleResponse(message) {
        console.log("message received in element.js");
    }

    function handleError(error) {
        console.log("error message sending in element.js");
    }

    document.getElementById('dropdown-tooltip').addEventListener("click", (e) => {
        console.log("HELLO, inside of click event listener of element.js")
        let response = browser.runtime.sendMessage({
            command: "elementCommand",
            content: "message originating from element.js",
        });

        response.then(handleResponse, handleError);
    });

    document.getElementById('name').addEventListener("click", (e) => {
        console.log("HELLO, inside of click event listener of element.js")
        let response = browser.runtime.sendMessage({
            command: "elementCommand",
            content: "message originating from element.js",
        });

        response.then(handleResponse, handleError);
    });
})();