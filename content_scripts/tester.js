(function () {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
    function runTest(testName) {
        var testFunction = "test_" + testName;
        if (typeof window[testFunction] === "function") {
            window[testFunction]();
        }
    }
    browser.runtime.onMessage.addListener(function (message) {
        if (message.command === "runTest") {
            runTest(message.testName);
        }
    });
    self.test_tabindex = function () {
        var tabindexElements = document.querySelectorAll("*[tabindex]");
        var failedTabindexElements = [];
        for (var i = 0; i < tabindexElements.length; i++) {
            var node = tabindexElements[i];
            var tabindexValue = parseInt(node.getAttribute("tabindex"));
            if (tabindexValue > 0) {
                failedTabindexElements.push(node);
            }
        }
        showFailures(failedTabindexElements, "Elements should not have positive tabindex values");
    };
    self.test_event_handlers = function () {
        var handlerList = ["click", "dblclick", "mousedown", "mouseup", "mousewheel", "change", "toggle", "keydown", "keyup", "keypress", "input"];
        var selectors = handlerList.map(function (handlerName) {
            return "*[on" + handlerName + "]";
        });
        var inlineEventElements = document.querySelectorAll(selectors.join(", "));
        var interactiveRoles = ["button", "checkbox", "link", "menu", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "scrollbar", "slider", "spinbutton", "switch"];
        var interactiveElements = ["input", "textarea", "select", "option", "button", "a", "video", "audio"];
        var failingElements = [];
        for (var i = 0; i < inlineEventElements.length; i++) {
            var node = inlineEventElements[i];
            var nodeRole = node.getAttribute("role");
            var nodeName = node.nodeName.toLowerCase();
            var isElementInteractiveByDefault = interactiveElements.includes(nodeName);
            var isRoleNonInteractive = (nodeRole === null || !interactiveRoles.includes(nodeRole));
            if (!isElementInteractiveByDefault && isRoleNonInteractive) {
                failingElements.push(node);
            }
        }
        showFailures(failingElements, "Non interactive elements like <div> should have an interactive role value assigned them if they have event handlers");
    };
    self.test_table_appearance = function () {
        var tables = document.getElementsByTagName("table");
        var failingTables = [];
        var failingRows = [];
        var failingHeadings = [];
        var failingCells = [];
        for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var tableDisplay = getComputedStyleForNode(table, "display");
            var tableRole = table.getAttribute("role");
            if (tableDisplay !== "table" && (tableRole !== "table")) {
                failingTables.push(table);
                continue;
            }
            var hasFailedRow = hasDescdendantsOfTypeWithoutGivenComputedStyle(table, "tr:not([role=row])", "display", ["table-row"]);
            if (hasFailedRow === true) {
                failingRows.push(table);
                continue;
            }
            var hasFailedHeading = hasDescdendantsOfTypeWithoutGivenComputedStyle(table, "th:not([role=columnheader]):not([role=rowheader])", "display", ["table-cell"]);
            if (hasFailedHeading === true) {
                failingHeadings.push(table);
                continue;
            }
            var hasFailedCell = hasDescdendantsOfTypeWithoutGivenComputedStyle(table, "td:not([role=cell])", "display", ["table-cell"]);
            if (hasFailedCell === true) {
                failingCells.push(table);
                continue;
            }
        }
        showFailures(failingTables, "Tables should have role=\"table\" if CSS changes their display value");
        showFailures(failingRows, "Table rows should have role=\"row\" if CSS changes their display value");
        showFailures(failingHeadings, "Table headings should have role=\"columnheader\" or role=\"rowheader\" if CSS changes their display value");
        showFailures(failingCells, "Table cells should have role=\"cell\" if CSS changes their display value");
    };
    self.test_disable_styles = function () {
        var externalStylesheets = document.querySelectorAll("link[rel=stylesheet]");
        var inlineStyles = document.querySelectorAll("*[style]");
        var blockStyles = document.getElementsByTagName("style");
        var stylesRemoved = getStylesRemoved();
        for (i = 0; i < externalStylesheets.length; i++) {
            var externalStylesheet = externalStylesheets[i];
            if (stylesRemoved) {
                enableExternalStyles(externalStylesheet);
            }
            else {
                disableExternalStyles(externalStylesheet);
            }
        }
        for (i = 0; i < inlineStyles.length; i++) {
            var inlineStyleElement = inlineStyles[i];
            if (stylesRemoved) {
                enableInlineStyle(inlineStyleElement);
            }
            else {
                disableInlineStyle(inlineStyleElement);
            }
        }
        for (i = 0; i < blockStyles.length; i++) {
            var blockStyleElement = blockStyles[i];
            if (stylesRemoved) {
                enableBlockStyle(blockStyleElement);
            }
            else {
                disableBlockStyle(blockStyleElement);
            }
        }
        if (stylesRemoved) {
            setStylesdisabledStatus(false);
        }
        else {
            setStylesdisabledStatus(true);
        }
    };
    self.test_min_font_size = function () {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        var textNode;
        var minimumPixelFontSize = 14;
        var failedTextSizeNodes = [];
        while (textNode = walker.nextNode()) {
            var textContent = getTextContentFromTextNode(textNode);
            if (textContent.length > 0) {
                var computedStyles = getComputerStylesForTextNode(textNode);
                var fontSize = parseInt(getPropertyFromComputedStyles(computedStyles, "font-size"));
                if (fontSize < minimumPixelFontSize) {
                    failedTextSizeNodes.push(textNode);
                }
            }
        }
        showFailures(failedTextSizeNodes, "Text falls below the minimum pixel threshold of " + minimumPixelFontSize);
    };
    self.test_colour_contrast = function () {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        var textNode;
        var failedTextContrast = [];
        while (textNode = walker.nextNode()) {
            var textContent = getTextContentFromTextNode(textNode);
            if (textContent.length > 0) {
                var computedStyles = getComputerStylesForTextNode(textNode);
                var background = getColourFromComputed(computedStyles, "background-color");
                var foreground = getColourFromComputed(computedStyles, "color");
                var fontSize = parseInt(getPropertyFromComputedStyles(computedStyles, "font-size"));
                var fontWeight = getPropertyFromComputedStyles(computedStyles, "font-weight");
                var contrast = getColourContrast(background, foreground);
                if (!doesTextContrast(fontSize, fontWeight, contrast)) {
                    failedTextContrast.push(textNode);
                }
            }
        }
        showFailures(failedTextContrast, "Text colour doesn't contrast enough with background");
    };
    self.test_blur = function () {
        addBodyFilter("blur", "1.5px");
    };
    self.test_colourblind_protanopia = function () {
        var matrix = ".56667 .43333 0      0 0\n\t\t              .55833 .44167 0      0 0\n\t\t              0      .24167 .75833 0 0\n\t\t              0      0      0      1 0";
        applySvgColorMatrixFilter(matrix, "protanopia");
    };
    self.test_colourblind_protanomaly = function () {
        var matrix = ".81667 .18333 0    0 0\n\t\t              .33333 .66667 0    0 0\n\t\t              0      .125   .875 0 0\n\t\t              0      0      0    1 0";
        applySvgColorMatrixFilter(matrix, "protanomaly");
    };
    self.test_colourblind_deuteranopia = function () {
        var matrix = ".625 .375 0  0 0\n\t\t              .7   .3   0  0 0\n\t\t              0    .3   .7 0 0\n\t\t              0    0    0  1 0";
        applySvgColorMatrixFilter(matrix, "deuteranopia");
    };
    self.test_colourblind_deutranomaly = function () {
        var matrix = ".8     .2     0      0 0\n\t\t              .25833 .74167 0      0 0\n\t\t              0      .14167 .85833 0 0\n\t\t              0      0      0      1 0";
        applySvgColorMatrixFilter(matrix, "deutranomaly");
    };
    self.test_colourblind_tritanopia = function () {
        var matrix = ".95 .5     0      0 0\n\t\t              0   .43333 .56667 0 0\n\t\t              0   .475   .525   0 0\n\t\t              0   0      0      1 0";
        applySvgColorMatrixFilter(matrix, "tritanopia");
    };
    self.test_colourblind_tritanomaly = function () {
        var matrix = ".96667 .3333  0      0 0\n\t\t              0      .73333 .26667 0 0\n\t\t              0      .18333 .81667 0 0\n\t\t              0      0      0      1 0";
        applySvgColorMatrixFilter(matrix, "tritanomaly");
    };
    self.test_colourblind_achromatopsia = function () {
        var matrix = ".299 .587 .114 0 0\n\t\t              .299 .587 .114 0 0\n\t\t              .299 .587 .114 0 0\n\t\t              0    0    0    1 0";
        applySvgColorMatrixFilter(matrix, "achromatopsia");
    };
    self.test_colourblind_achromatomaly = function () {
        var matrix = ".618 .32  .62  0 0\n\t\t              .163 .775 .62  0 0\n\t\t              .163 .320 .516 0 0\n\t\t              0    0    0    1 0";
        applySvgColorMatrixFilter(matrix, "achromatomaly");
    };
    self.test_reset_filters = function () {
        document.body.style.filter = "";
    };
    self.test_form_element_labels = function () {
        var inputs = document.querySelectorAll("input:not([type=submit]):not([type=reset]):not([type=button]):not([type=hidden]), select, textarea");
        var unlabeledInputs = [];
        var hiddenLabels = [];
        for (i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var parentLabel = getParentOfType(input, "label");
            var inputId = input.getAttribute("id");
            var associatedLabel = getElementWithAttributeValue("label", "for", inputId);
            if (!parentLabel && !associatedLabel) {
                unlabeledInputs.push(input);
            }
            else {
                var label = parentLabel ? parentLabel : associatedLabel;
                var labelDisplay = getComputedStyleForNode(label, "display");
                var labelVisibility = getComputedStyleForNode(label, "visibility");
                if (labelDisplay === "none" || labelVisibility === "hidden") {
                    hiddenLabels.push(input);
                }
            }
        }
        showFailures(unlabeledInputs, "Input elements don't have associated labels");
        showFailures(hiddenLabels, "Input labels should not be hidden with display: none; or visibility: hidden;");
    };
    self.test_bold_tags = function () {
        var boldTags = document.querySelectorAll("b");
        showFailures(Array.from(boldTags), "Bold (<b>) tags used, <strong> is more semantic");
    };
    self.test_italic_tags = function () {
        var italicTags = document.querySelectorAll("i");
        showFailures(Array.from(italicTags), "Italic (<i>) tags used, <em> is more semantic");
    };
    self.test_heading_levels = function () {
        var headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        var failedHeadings = [];
        var lastHeadingLevel = 0;
        if (headings.length === 0) {
            showSingleFailure("Page has no headings");
        }
        for (i = 0; i < headings.length; i++) {
            var heading = headings[i];
            var currentHeadingLevel = getHeadingLevel(heading);
            if (i === 0 && currentHeadingLevel !== 1) {
                showFailures([heading], "First heading in page is not <h1>");
            }
            if (currentHeadingLevel > lastHeadingLevel + 1) {
                failedHeadings = Array.from(headings);
                break;
            }
            lastHeadingLevel = currentHeadingLevel;
        }
        showFailures(failedHeadings, "Headings are not following a logical hierarchy");
    };
    self.test_audio = function () {
        var failedAudios = getMultimediaElementsWithoutTextTracks('audio');
        showFailures(failedAudios, "Some audio elements have no tracks marked as captions, subtitles, or a description");
    };
    self.test_audio_autoplay = function () {
        var failedAudios = getMultimediaElementsWithAutoplay('audio');
        showFailures(failedAudios, "Audio elements should not auto-play");
    };
    self.test_videos = function () {
        var failedVideos = getMultimediaElementsWithoutTextTracks('video');
        showFailures(failedVideos, "Some videos have no tracks marked as captions, subtitles, or a description");
    };
    self.test_videos_autoplay = function () {
        var failedVideos = getMultimediaElementsWithAutoplay('video');
        showFailures(failedVideos, "Videos should not auto-play");
    };
    self.test_images = function () {
        var images = document.querySelectorAll("img");
        var failedImages = [];
        var warnImages = [];
        var emptyAltDimensionThreshold = 100;
        for (i = 0; i < images.length; i++) {
            var image = images[i];
            var altText = image.getAttribute("alt");
            if (altText === null) {
                var childFigCaptionNode = getCousinOfType(image, "figure", "figcaption");
                if (childFigCaptionNode === false || (childFigCaptionNode && childFigCaptionNode.innerText.length === 0)) {
                    failedImages.push(image);
                }
            }
            else {
                if (altText === '' && image.width > emptyAltDimensionThreshold && image.height > emptyAltDimensionThreshold) {
                    warnImages.push(image);
                }
            }
        }
        showFailures(failedImages, "Some images have no alt text and were not found with a corresponding <figcaption>", false);
        showWarnings(warnImages, "Some images have empty alt text and are larger than the threshold of " + emptyAltDimensionThreshold + " pixels");
        if (!failedImages.length && !warnImages.length) {
            showSuccess("No problems found");
        }
    };
})();
//# sourceMappingURL=tester.js.map