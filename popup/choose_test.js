function listenForClicks() {
    document.addEventListener("click", function (e) {
        if (e.target.classList.contains("test")) {
            browser.tabs.query({ active: true, currentWindow: true })
                .then(runTest)["catch"](reportError);
        }
        function runTest(tabs) {
            var testName = getTestName(e.target);
            browser.tabs.sendMessage(tabs[0].id, {
                command: "runTest",
                testName: testName
            });
        }
        function reportError(error) {
            console.error("Could not run test: " + error);
        }
        function getTestName(selectedTest) {
            return selectedTest.dataset.testName;
        }
    });
}
function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error("Failed to execute content script: " + error.message);
}
browser.tabs.executeScript({ file: "/content_scripts/tester.js" })
    .then(listenForClicks)["catch"](reportExecuteScriptError);
//# sourceMappingURL=choose_test.js.map