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
			
			if(altText == null) {
				// check here to see if the image is part of a <figure> and has a <figcaption>
				let parentFigureNode = isDescendantOfType(image, 'figure');
				if(!parentFigureNode) {
					failedImages.push(image);
				} else {
					// check here to see if this <figure> has a <figcaption> child
				}
			}
			
			if(altText == '' && image.width > emptyAltDimensionThreshold && image.height > emptyAltDimensionThreshold) {
				warnImages.push(image);
			}
		}
		
		if(failedImages.length) {
			console.error('Some images have no alt text and were not found with a corresponding <figcaption>');
			console.table(failedImages);
		}
		if(warnImages.length) {
			console.warn(`Some images have empty alt text and are larger than the threshold of ${emptyAltDimensionThreshold} pixels`);
			console.table(warnImages);
		}
	}
	
	function isDescendantOfType(childNode, type) {
		var node = childNode.parentNode;
		while (node != null) {
			if (node == type) {
				return node;
			}
			node = node.parentNode;
		}
		return false;
	}
})();
