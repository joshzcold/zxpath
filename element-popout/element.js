(function () {
    function handleResponse(message) {
        console.log("message received in element.js");
    }

    function handleError(error) {
        console.log("error message sending in element.js");
    }

    document.getElementById('dropdown-tooltip').addEventListener("click", (e) => {
        if ($(e.target).attr('class').includes("list-group-item"))
            console.log(e.target.textContent);

        // console.log($(e.target).attr('class'));

        let response = browser.runtime.sendMessage({
            command: "elementCommand",
            content: "message originating from element.js"
        });

        response.then(handleResponse, handleError);
    });

    document.getElementById('name').addEventListener("input", (e) => {
        let inputName = e.target.value;
        console.log(inputName);
        let response = browser.runtime.sendMessage({
            command: "elementCommand",
            content: "message originating from element.js"
        });

        response.then(handleResponse, handleError);
    });
})();