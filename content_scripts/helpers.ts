interface Window {
	stylesRemoved: boolean,
	hasRun: boolean,
	test_tabindex: Function,
	test_event_handlers: Function,
	test_table_appearance: Function,
	test_disable_styles: Function,
	test_min_font_size: Function,
	test_colour_contrast: Function,
	test_blur: Function,
	test_colourblind_protanopia: Function,
	test_colourblind_protanomaly: Function,
	test_colourblind_deuteranopia: Function,
	test_colourblind_deutranomaly: Function,
	test_colourblind_tritanopia: Function,
	test_colourblind_tritanomaly: Function,
	test_colourblind_achromatopsia: Function,
	test_colourblind_achromatomaly: Function,
	test_reset_filters: Function,
	test_form_element_labels: Function,
	test_bold_tags: Function,
	test_italic_tags: Function,
	test_heading_levels: Function,
	test_audio: Function,
	test_audio_autoplay: Function,
	test_videos: Function,
	test_videos_autoplay: Function;
	test_images: Function,
}

function addBodyFilter(filterName: string, filterOptions: any) {
	let existingFilters = document.body.style.filter;

	if(!existingFilters.includes(filterName)) {
		let newFilter = `${existingFilters} ${filterName}(${filterOptions})`;

		document.body.style.filter = newFilter;
	}
}

function removeBodyFilter(filterName: string) {
	let existingFilters = document.body.style.filter;

	if(existingFilters.includes(filterName)) {
		let filterRegex = new RegExp(filterName + "\\([^\\)]+\\)");
		let newFilterList = existingFilters.replace(filterRegex, "");

		document.body.style.filter = newFilterList;
	}
}

function addHtmlWithIdIfNotPresent(elementId: string, html: string) {
	let elementExists = document.getElementById(elementId);

	if(!elementExists) {
		document.body.insertAdjacentHTML("beforeend", html);
	}
}

function applySvgColorMatrixFilter(matrix: string, filterName: string) {
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

function showFailures(failureList: Element[]|HTMLElement[], failureMessage: string, successOnEmpty: boolean = true) {
	if(failureList.length) {
		console.error(failureMessage);
		console.table(failureList);
	}
	
	if(failureList.length === 0 && successOnEmpty) {
		showSuccess("No problems found");
	}
}

function showSuccess(message: string) {
	console.info(message);
}

function showSingleFailure(failureMessage: string) {
	console.error(failureMessage);
}

function showWarnings(warningList: Element[]|HTMLElement[], warningMessage: string) {
	if(warningList.length) {
		console.warn(warningMessage);
		console.table(warningList);
	}
}

function getHeadingLevel(heading: Element) {
	let headingString = heading.tagName.toLowerCase();

	return parseInt(headingString.substring(1));
}

function getMultimediaElementsWithoutTextTracks(mediaType: string) {
	let multimediaElements = document.querySelectorAll(mediaType);
	let failingElements = [];

	for(let i=0; i<multimediaElements.length; i++) {
		let multimediaElement = multimediaElements[i];
		let track = multimediaElement.querySelectorAll("track[kind=subtitles], track[kind=captions], track[kind=descriptions]");

		if(track.length === 0) {
			failingElements.push(multimediaElement);
		}
	}

	return failingElements;
}

function getMultimediaElementsWithAutoplay(mediaType: string) {
	let multimediaElements = document.querySelectorAll(`${mediaType}[autoplay]`);

	return Array.from(multimediaElements);
}

function getElementWithAttributeValue(elementType: string, attribute: string, attributeValue: string) {
	if(attributeValue === null)
		return false;

	let element = document.querySelector(`${elementType}[${attribute}=${attributeValue}]`);

	return element;
}

function getCousinOfType(node: Element, parentType: string, childType: string) {
	let parentNode = getParentOfType(node, parentType);
	let childNode = getDescendantOfType(parentNode, childType);

	if(parentNode && childNode)
		return childNode;

	return false;
}

function getParentOfType(childNode: any, type: string) {
	var node = <HTMLElement> childNode.parentNode;

	while (node !== null && node.tagName !== undefined) {
		if (node.tagName.toLowerCase() === type) {
			return node;
		}
		node = <HTMLElement> node.parentNode;
	}
	return false;
}

function getDescendantOfType(parentNode: any, type: string) {
	if(!parentNode)
		return false;

	let node = <HTMLElement> parentNode.querySelector(type);
	if(node !== null)
		return node;

	return false;
}

function getDescendantsOfType(parentNode: any, type: string) {
	if(!parentNode)
		return false;
	
	let nodes = <HTMLElement> parentNode.querySelectorAll(type);
	if(nodes !== null)
		return nodes;

	return false;
}

function doesTextContrast(fontSize: number, fontWeight: number, contrast: number) {
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

function getColourFromComputed(computedStyles: CSSStyleDeclaration, colourProperty: string) {
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

function convertRGBAtoRGB(r: number, g: number, b: number, alpha: number) {
	let defaultBackground = 255; // 255 for each RBG component

	return {
		r: (1 - alpha) * defaultBackground + alpha * r,
		g: (1 - alpha) * defaultBackground + alpha * g,
		b: (1 - alpha) * defaultBackground + alpha * b
	};
}

function getPropertyFromComputedStyles(computedStyles: any, property: string) {
	return computedStyles.getPropertyValue(property);
}

function getTextContentFromTextNode(textNode: HTMLElement) {
	return textNode.textContent.trim();
}

function getComputerStylesForTextNode(textNode: HTMLElement) {
	return getComputedStylesForNode(textNode.parentNode);
}

function getComputedStylesForNode(node: any) {
	return window.getComputedStyle(node);
}

function getComputedStyleForNode(node: Element|boolean, property: string) {
	let computedStyles = getComputedStylesForNode(node);
	
	return getPropertyFromComputedStyles(computedStyles, property);
}

function hasDescdendantsOfTypeWithoutGivenComputedStyle(node: Element, descendantSelector: string, computedStyleProperty: string, matchingValues: string[]) {
	let children = node.querySelectorAll(descendantSelector);

	for(let i=0; i<children.length; i++) {
		let childNode = children[i];
		let computedStyleValue = getComputedStyleForNode(childNode, computedStyleProperty);
		
		if(!matchingValues.includes(computedStyleValue))
			return true;
	}
	
	return false;
}

function getColourContrast(rgb1: any, rgb2: any) {
	let luminance1 = getColourLuminance(rgb1.r, rgb1.g, rgb1.b);
	let luminance2 = getColourLuminance(rgb2.r, rgb2.g, rgb2.b);

	return luminance1 / luminance2;
}

function getColourLuminance(r: number, g: number, b: number) {
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

function setStylesdisabledStatus(status: boolean) {
	window.stylesRemoved = status;
}

function disableExternalStyles(externalStylesheet: Element) {
	let href = externalStylesheet.getAttribute("href");

	externalStylesheet.setAttribute("data-disabled-href", href);
	externalStylesheet.removeAttribute("href");
}

function enableExternalStyles(externalStylesheet: any) {
	let href = externalStylesheet.dataset.disabledHref;

	externalStylesheet.setAttribute("href", href);
}

function enableInlineStyle(element: any) {
	let style = element.dataset.disabledStyle;
	
	element.setAttribute("style", style);
}

function disableInlineStyle(element: Element) {
	let style = element.getAttribute("style");
	
	element.setAttribute("data-disabled-style", style);
	element.setAttribute("style", "");
}

function enableBlockStyle(element: any) {
	let style = atob(element.dataset.disabledBlockStyle);
	
	element.innerHTML = style;
}

function disableBlockStyle(element: Element) {
	let style = btoa(element.innerHTML);

	element.setAttribute("data-disabled-block-style", style);
	element.innerHTML = "";
}