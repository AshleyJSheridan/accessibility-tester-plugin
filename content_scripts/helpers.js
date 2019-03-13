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

function showFailures(testName, failureList, failureMessage, successOnEmpty = true) {
	if(failureList.length) {
		console.error(failureMessage);
		console.table(failureList);
	}
	
	if(failureList.length === 0 && successOnEmpty) {
		showSuccess(testName);
	}
}

function showSuccess(testName) {
	console.info("No problems found");
}

function showSingleFailure(testName, failureMessage) {
	console.error(failureMessage);
}

function showWarnings(testName, warningList, warningMessage) {
	if(warningList.length) {
		console.warn(warningMessage);
		console.table(warningList);
	}
}

function getHeadingLevel(heading) {
	let headingString = heading.tagName.toLowerCase();

	return parseInt(headingString.substring(1));
}

function getMultimediaElementsWithoutTextTracks(mediaType) {
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

function getMultimediaElementsWithAutoplay(mediaType) {
	let multimediaElements = document.querySelectorAll(`${mediaType}[autoplay]`);

	return Array.from(multimediaElements);
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

function getDescendantsOfType(parentNode, type) {
	if(!parentNode)
		return false;
	
	nodes = parentNode.querySelectorAll(type);
	if(nodes !== null)
		return nodes;

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
	return getComputedStylesForNode(textNode.parentNode);
}

function getComputedStylesForNode(node) {
	return window.getComputedStyle(node);
}

function getComputedStyleForNode(node, property) {
	let computedStyles = getComputedStylesForNode(node);
	
	return getPropertyFromComputedStyles(computedStyles, property);
}

function hasDescdendantsOfTypeWithoutGivenComputedStyle(node, descendantSelector, computedStyleProperty, matchingValues) {
	let children = node.querySelectorAll(descendantSelector);

	for(let i=0; i<children.length; i++) {
		let childNode = children[i];
		let computedStyleValue = getComputedStyleForNode(childNode, computedStyleProperty);
		
		if(!matchingValues.includes(computedStyleValue))
			return true;
	}
	
	return false;
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

function getStylesRemoved() {
	return !!window.stylesRemoved;
}

function setStylesdisabledStatus(status) {
	window.stylesRemoved = status;
}

function disableExternalStyles(externalStylesheet) {
	let href = externalStylesheet.getAttribute("href");

	externalStylesheet.setAttribute("data-disabled-href", href);
	externalStylesheet.removeAttribute("href");
}

function enableExternalStyles(externalStylesheet) {
	let href = externalStylesheet.dataset.disabledHref;

	externalStylesheet.setAttribute("href", href);
}

function enableInlineStyle(element) {
	let style = element.dataset.disabledStyle;
	
	element.setAttribute("style", style);
}

function disableInlineStyle(element) {
	let style = element.getAttribute("style");
	
	element.setAttribute("data-disabled-style", style);
	element.setAttribute("style", "");
}

function enableBlockStyle(element) {
	let style = atob(element.dataset.disabledBlockStyle);
	
	element.innerHTML = style;
}

function disableBlockStyle(element) {
	let style = btoa(element.innerHTML);

	element.setAttribute("data-disabled-block-style", style);
	element.innerHTML = "";
}