function addBodyFilter(filterName, filterOptions) {
	let existingFilters = document.body.style.filter;

	if(!existingFilters.includes(filterName)) {
		let newFilter = `${existingFilters} ${filterName}(${filterOptions})`;

		document.body.style.filter = newFilter;
	}
}

function removeBodyFilter(filterName) {
	let existingFilters = document.body.style.filter;

	if(existingFilters.includes(filterName)) {
		let filterRegex = new RegExp(filterName + "\\([^\\)]+\\)");
		let newFilterList = existingFilters.replace(filterRegex, "");

		document.body.style.filter = newFilterList;
	}
}

function addHtmlWithIdIfNotPresent(elementId, html) {
	let elementExists = document.getElementById(elementId);

	if(!elementExists) {
		document.body.insertAdjacentHTML("beforeend", html);
	}
}

function applySvgColorMatrixFilter(matrix, filterName) {
	let filterId = `filter_${filterName}`;
	let svgFilterHtml = `<svg height="0">
		<filter id="${filterId}">
			<feColorMatrix values="${matrix}"/>
		</filter>
	</svg>`;

	addHtmlWithIdIfNotPresent(filterId, svgFilterHtml);
	removeBodyFilter("url");
	addBodyFilter("url", `#${filterId}`);
}

function showFailures(failureList, failureMessage) {
	if(failureList.length) {
		console.error(failureMessage);
		console.table(failureList);
	}
}

function showSingleFailure(failureMessage) {
	console.error(failureMessage);
}

function showWarnings(warningList, warningMessage) {
	if(warningList.length) {
		console.warn(warningMessage);
		console.table(warningList);
	}
}

function getHeadingLevel(heading) {
	let headingString = heading.tagName.toLowerCase();

	return parseInt(headingString.substring(1));
}

function getFailingMultimediaElements(mediaType) {
	let multimediaElements = document.querySelectorAll(mediaType);
	let failingElements = [];

	for(i=0; i<multimediaElements.length; i++) {
		let multimediaElement = multimediaElements[i];
		let track = multimediaElement.querySelectorAll("track[kind=subtitles], track[kind=captions], track[kind=descriptions]");

		if(track.length === 0) {
			failingElements.push(multimediaElement);
		}
	}

	return failingElements;
}

function getElementWithAttributeValue(elementType, attribute, attributeValue) {
	if(attributeValue === null)
		return false;

	let element = document.querySelector(`${elementType}[${attribute}=${attributeValue}]`);

	return element;
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

function doesTextContrast(fontSize, fontWeight, contrast) {
	let minContrastLevel = 4.5;
	let largeTextContrastLevel = 3;
	let largeTextSize = 24;
	let largeTextSizeBold = 18.66;
	let boldTextWeight = 700;

	let passedMinContrast = contrast >= minContrastLevel;
	let isLargeText = (fontSize >= largeTextSize) || (fontWeight >= boldTextWeight && fontSize >= largeTextSizeBold);
	let passedLargeTextMinContrast = (isLargeText && contrast >= largeTextContrastLevel);

	return passedMinContrast || passedLargeTextMinContrast;
}

function getColourFromComputed(computedStyles, colourProperty) {
	let colour = getPropertyFromComputedStyles(computedStyles, colourProperty);
	let colourComponents;

	if(colour.match(/^rgba/)) {
		colourComponents = colour.match(/^rgba\((\d+), ?(\d+), ?(\d+), ?(\d+)/);

		return convertRGBAtoRGB(colourComponents[1], colourComponents[2], colourComponents[3], colourComponents[4]);
	}

	colourComponents = colour.match(/^rgb\((\d+), ?(\d+), ?(\d+)/);
	return {
		r: parseInt(colourComponents[1]),
		g: parseInt(colourComponents[2]),
		b: parseInt(colourComponents[3])
	};
}

function convertRGBAtoRGB(r, g, b, alpha) {
	let defaultBackground = 255; // 255 for each RBG component

	return {
		r: (1 - alpha) * 255 + alpha * r,
		g: (1 - alpha) * 255 + alpha * g,
		b: (1 - alpha) * 255 + alpha * b
	};
}

function getPropertyFromComputedStyles(computedStyles, property) {
	return computedStyles.getPropertyValue(property);
}

function getTextContentFromTextNode(textNode) {
	return textNode.textContent.trim();
}

function getComputerStylesForTextNode(textNode) {
	return window.getComputedStyle(textNode.parentNode);
}

function getColourContrast(rgb1, rgb2) {
	let luminance1 = getColourLuminance(rgb1.r, rgb1.g, rgb1.b);
	let luminance2 = getColourLuminance(rgb2.r, rgb2.g, rgb2.b);

	return luminance1 / luminance2;
}

function getColourLuminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= .03928
			? v / 12.92
			: Math.pow( (v + .055) / 1.055, 2.4 );
	});

	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * .0722 + .05;
}