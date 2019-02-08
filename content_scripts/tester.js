(function() {
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	function runTest(testName) {
		let testFunction = `test_${testName}`;
		
		if(typeof window[testFunction] === 'function') {
			window[testFunction]();
		}
	}

	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "runTest") {
			runTest(message.testName);
		}
	});
	
	self.test_audio = function() {
		failedAudios = getFailingMultimediaElements('audio');
		
		showFailures(failedAudios, 'Some audio elements have no tracks marked as captions, subtitles, or a description');
	}

	self.test_videos = function() {
		failedVideos = getFailingMultimediaElements('video');
		
		showFailures(failedVideos, 'Some videos have no tracks marked as captions, subtitles, or a description');
	}
	
	function getFailingMultimediaElements(mediaType) {
		let multimediaElements = document.querySelectorAll(mediaType);
		let failingElements = [];
		
		for(i=0; i<multimediaElements.length; i++) {
			let multimediaElement = multimediaElements[i];
			let track = multimediaElement.querySelectorAll('track[kind=subtitles], track[kind=captions], track[kind=descriptions]');
			
			if(track.length === 0) {
				failingElements.push(multimediaElement);
			}
		}
		
		return failingElements;
	}

	self.test_images = function() {
		let images = document.querySelectorAll('img');
		let failedImages = [];
		let warnImages = [];
		let emptyAltDimensionThreshold = 100;
		
		for(i=0; i<images.length; i++) {
			let image = images[i];
			let altText = image.getAttribute('alt');
			
			if(altText === null) {
				let childFigCaptionNode = getCousinOfType(image, 'figure', 'figcaption');
				
				if(childFigCaptionNode === false || (childFigCaptionNode && childFigCaptionNode.innerText.length === 0)) {
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
	
	function getCousinOfType(node, parentType, childType) {
		let parentNode = getParentOfType(node, parentType);
		let childNode = getDescendantOfType(parentNode, childType);
		
		if(parentNode && childNode)
			return childNode;
		
		return false;
	}
	
	function getParentOfType(childNode, type) {
		var node = childNode.parentNode;

		while (node !== null && node.tagName !== undefined) {
			if (node.tagName.toLowerCase() === type) {
				return node;
			}
			node = node.parentNode;
		}
		return false;
	}
	
	function getDescendantOfType(parentNode, type) {
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
