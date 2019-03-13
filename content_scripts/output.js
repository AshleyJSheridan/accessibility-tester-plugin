function showFailures(testName, failureList, failureMessage, successOnEmpty = true) {
	if(failureList.length) {
		console.error(testName);
		console.error(failureMessage);
		console.table(failureList);
	}
	
	if(failureList.length === 0 && successOnEmpty) {
		showSuccess(testName);
	}
}

function showSuccess(testName) {
	console.info(testName);
	console.info("No problems found");
}

function showSingleFailure(testName, failureMessage) {
	console.error(testName);
	console.error(failureMessage);
}

function showWarnings(testName, warningList, warningMessage) {
	if(warningList.length) {
		console.warn(testName);
		console.warn(warningMessage);
		console.table(warningList);
	}
}
