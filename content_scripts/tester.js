(function() {
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	function runTest(testName) {
		let testFunction = `test_${testName}`;

		if(typeof window[testFunction] === "function") {
			window[testFunction]();
		}
	}

	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "runTest") {
			runTest(message.testName);
		}
	});
	
	self.test_colour_contrast = function() {
		let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
		let textNode;
		let failedTextContrast = [];
		
		while(textNode = walker.nextNode()) {
			let textContent = getTextContentFromTextNode(textNode);
			
			if(textContent.length > 0) {
				let computedStyles = getComputerStylesForTextNode(textNode);
				
				let background = getColourFromComputed(computedStyles, "background-color");
				let foreground = getColourFromComputed(computedStyles, "color");
				let fontSize = parseInt(getPropertyFromComputedStyles(computedStyles, "font-size"));
				let fontWeight = getPropertyFromComputedStyles(computedStyles, "font-weight");
				let contrast = getColourContrast(background, foreground);
				
				if(!doesTextContrast(fontSize, fontWeight, contrast)) {
					failedTextContrast.push(textNode);
				}
			}
		}
		
		showFailures(failedTextContrast, "Text colour doesn't contrast enough with background");
	}

	self.test_blur = function() {
		addBodyFilter("blur", "1.5px");
	}

	self.test_colourblind_protanopia = function() {
		let matrix = `.56667 .43333 0      0 0
		              .55833 .44167 0      0 0
		              0      .24167 .75833 0 0
		              0      0      0      1 0`;
		
		applySvgColorMatrixFilter(matrix, "protanopia");
	}
	
	self.test_colourblind_protanomaly = function() {
		let matrix = `.81667 .18333 0    0 0
		              .33333 .66667 0    0 0
		              0      .125   .875 0 0
		              0      0      0    1 0`;
		
		applySvgColorMatrixFilter(matrix, "protanomaly");
	}

	self.test_colourblind_deuteranopia = function() {
		let matrix = `.625 .375 0  0 0
		              .7   .3   0  0 0
		              0    .3   .7 0 0
		              0    0    0  1 0`;
		
		applySvgColorMatrixFilter(matrix, "deuteranopia");
	}

	self.test_colourblind_deutranomaly = function() {
		let matrix = `.8     .2     0      0 0
		              .25833 .74167 0      0 0
		              0      .14167 .85833 0 0
		              0      0      0      1 0`;
		
		applySvgColorMatrixFilter(matrix, "deutranomaly");
	}

	self.test_colourblind_tritanopia = function() {
		let matrix = `.95 .5     0      0 0
		              0   .43333 .56667 0 0
		              0   .475   .525   0 0
		              0   0      0      1 0`;
		
		applySvgColorMatrixFilter(matrix, "tritanopia");
	}

	self.test_colourblind_tritanomaly = function() {
		let matrix = `.96667 .3333  0      0 0
		              0      .73333 .26667 0 0
		              0      .18333 .81667 0 0
		              0      0      0      1 0`;
		
		applySvgColorMatrixFilter(matrix, "tritanomaly");
	}

	self.test_colourblind_achromatopsia = function() {
		let matrix = `.299 .587 .114 0 0
		              .299 .587 .114 0 0
		              .299 .587 .114 0 0
		              0    0    0    1 0`;
		
		applySvgColorMatrixFilter(matrix, "achromatopsia");
	}

	self.test_colourblind_achromatomaly = function() {
		let matrix = `.618 .32  .62  0 0
		              .163 .775 .62  0 0
		              .163 .320 .516 0 0
		              0    0    0    1 0`;
		
		applySvgColorMatrixFilter(matrix, "achromatomaly");
	}

	self.test_reset_filters = function() {
		document.body.style.filter = "";
	}

	self.test_form_element_labels = function() {
		let inputs = document.querySelectorAll("input:not([type=submit]):not([type=reset]):not([type=button]):not([type=hidden]), select, textarea");
		let failedInputs = [];
		
		for(i=0; i<inputs.length; i++) {
			let input = inputs[i];
			
			let parentLabel = getParentOfType(input, "label");
			let inputId = input.getAttribute("id");
			let associatedLabel = getElementWithAttributeValue("label", "for", inputId);
			
			if(!parentLabel && !associatedLabel) {
				failedInputs.push(input);
			}
		}
		
		showFailures(failedInputs, "Input elements don't have associated labels");
	}
	
	self.test_bold_tags = function() {
		let boldTags = document.querySelectorAll("b");
		
		showFailures(Array.from(boldTags), "Bold (<b>) tags used, <strong> is more semantic");
	}
	
	self.test_italic_tags = function() {
		let italicTags = document.querySelectorAll("i");
		
		showFailures(Array.from(italicTags), "Italic (<i>) tags used, <em> is more semantic");
	}
	
	self.test_heading_levels = function() {
		let headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
		let failedHeadings = [];
		let lastHeadingLevel = 0;
		
		if(headings.length === 0) {
			showSingleFailure("Page has no headings");
		}
		
		for(i=0; i<headings.length; i++) {
			let heading = headings[i];
			let currentHeadingLevel = getHeadingLevel(heading);
			
			if(i === 0 && currentHeadingLevel !== 1) {
				showFailures([heading], "First heading in page is not <h1>");
			}

			if(currentHeadingLevel > lastHeadingLevel + 1) {
				failedHeadings = Array.from(headings);
				break;
			}
			
			lastHeadingLevel = currentHeadingLevel;
		}
		
		showFailures(failedHeadings, "Headings are not following a logical hierarchy");
	}
	
	self.test_audio = function() {
		let failedAudios = getFailingMultimediaElements('audio');
		
		showFailures(failedAudios, "Some audio elements have no tracks marked as captions, subtitles, or a description");
	}

	self.test_videos = function() {
		let failedVideos = getFailingMultimediaElements('video');
		
		showFailures(failedVideos, "Some videos have no tracks marked as captions, subtitles, or a description");
	}
	
	self.test_images = function() {
		let images = document.querySelectorAll("img");
		let failedImages = [];
		let warnImages = [];
		let emptyAltDimensionThreshold = 100;
		
		for(i=0; i<images.length; i++) {
			let image = images[i];
			let altText = image.getAttribute("alt");
			
			if(altText === null) {
				let childFigCaptionNode = getCousinOfType(image, "figure", "figcaption");
				
				if(childFigCaptionNode === false || (childFigCaptionNode && childFigCaptionNode.innerText.length === 0)) {
					failedImages.push(image);
				}
			} else {
				if(altText === '' && image.width > emptyAltDimensionThreshold && image.height > emptyAltDimensionThreshold) {
					warnImages.push(image);
				}
			}
		}
		
		showFailures(failedImages, "Some images have no alt text and were not found with a corresponding <figcaption>", false);
		showWarnings(warnImages, `Some images have empty alt text and are larger than the threshold of ${emptyAltDimensionThreshold} pixels`);
		
		if(!failedImages.length && !warnImages.length) {
			showSuccess("No problems found");
		}
	}

})();
