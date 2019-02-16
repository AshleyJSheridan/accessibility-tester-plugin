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