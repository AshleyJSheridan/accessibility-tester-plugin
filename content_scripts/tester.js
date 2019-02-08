(function() {
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	function runTest(testName) {
		let testFunction = `test_${testName}`;
		
		if(typeof window[testFunction] == 'function') {
			window[testFunction]();
		}
	}

	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "runTest") {
			runTest(message.testName);
		}
	});

	self.test_images = function() {
		let images = document.querySelectorAll('img');
		let failedImages = [];
		let warnImages = [];
		let emptyAltDimensionThreshold = 100;
		
		for(i=0; i<images.length; i++) {
			let image = images[i];
			let altText = image.getAttribute('alt');
			
			if(altText === null) {
				// check here to see if the image is part of a <figure> and has a <figcaption>
				let parentFigureNode = isDescendantOfType(image, 'figure');
				let childFigCaptionNode = hasDescendantOfType(parentFigureNode, 'figcaption');
				
				if(parentFigureNode === false || childFigCaptionNode === false) {
					failedImages.push(image);
				} 
				
				if(childFigCaptionNode && childFigCaptionNode.innerText.length === 0) {
					failedImages.push(image);
				}
			} else {
				if(altText === '' && image.width > emptyAltDimensionThreshold && image.height > emptyAltDimensionThreshold) {
					warnImages.push(image);
				}
			}
		}
		
		showFailures(failedImages, 'Some images have no alt text and were not found with a corresponding <figcaption>');
		showWarnings(warnImages, `Some images have empty alt text and are larger than the threshold of ${emptyAltDimensionThreshold} pixels`);
	}
	
	function isDescendantOfType(childNode, type) {
		var node = childNode.parentNode;

		while (node !== null && node.tagName !== undefined) {
			if (node.tagName.toLowerCase() === type) {
				return node;
			}
			node = node.parentNode;
		}
		return false;
	}
	
	function hasDescendantOfType(parentNode, type) {
		if(!parentNode)
			return false;
		
		node = parentNode.querySelector(type);
		if(node !== null)
			return node;
		
		return false;
	}
	
	function showFailures(failureList, failureMessage) {
		if(failureList.length) {
			console.error(failureMessage);
			console.table(failureList);
		}
	}
	
	function showWarnings(warningList, warningMessage) {
		if(warningList.length) {
			console.warn(warningMessage);
			console.table(warningList);
		}
	}
})();
