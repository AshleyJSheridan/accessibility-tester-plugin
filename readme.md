# Site Accessibility Tester Add-on for Firefox

This is a work-in-progress add-on for Firefox to serve as an aid to developers ensuring their web content is accessible.

While it's in the initial stages of development, it will only be available as a Temporary Add-on.

## Installation

* Check out the repository locally
* Open Firefox and point to `about:debug` in the address bar
* Click on the `Load Temporary Add-on...` button and navigate to the project directory and load the `manifest.json` file there

## Using the Add-on

_Note: This add-on will only be available for the current session that it's loaded due to it being in a temporary load state._

Once the add-on has been loaded, visit any page, and open the Firefox developer tools (`F12` on most systems). This will show a menu similar to the following:

![Accessibility add-on main menu](docs/img/plugin-menu.png)

Tests are grouped under the Layout, Visual, or Audible tabs, depeding on the type of test. Each one will either affect the current page being viewed (such as one of the colour blindness filters) or it will output an error to the browsers console window (if there is any error to report).

For example, running the "Heading Levels" test on the `test sources/heading fail test.html` page of the project will give an error report in the console similar to this:

![Accessibility add-on example error table](docs/img/heading-error-console.png)

The colour blindness and blur filter tests affect the page currently being viewed, and have no error output in the console. These tests are to help simulate the page under particular visual conditions, so that you can more easily identify any problem areas. Running the blur and achromatopsia colour blindness tests on my [How Readable is Your Content? blog post](http://www.ashleysheridan.co.uk/blog/How+Readable+is+Your+Content%3F) will show something similar to this:

![Blur and achromatopsia simulation filter being applied to a web page](docs/img/blur-achromatopsia-filters.png)

### Error Messages

If a test produces an error message table, it will list out each element that fails the test. For example, if the heading levels on a page don't have a logical order, the entire heading list will be output.

Beside each element is a small icon:

![Firefox DOM inspect icon](docs/img/element-inspect-icon.png)

Hovering this will highlight the element on the page, and clicking it will take you directly through to that element in the <abbr title="Document Object Model">DOM</abbr> inspector. This will help you get to the source of any problems more quickly.

## The Tests

Section|Test Name|Description
---|---|---
Layout|Heading levels|Check that the page starts with an `<h1>` level heading, at the levels are logical throughout the page, and don't skip levels for visual purposes
Layout|Form element labels|Check that all visible form elements have labels that either wrap the element, or are associated via an `id` and `for` combination, and ensure that labels are not set to `display: none;` or `visibility: hidden;`
Layout|Bold tags|Look for any use of `<b>` tags
Layout|Italic tags|Look for any use of `<i>` tags
Layout|Table appearance|Checks table elements have correct `role` attributes if CSS changes their `display` property to a non-table type
Layout|Event handlers|Looks for elements not interactive by default for any inline event handlers (e.g. `onclick`) and looks for an interactive `role` value assigned to them
Layout|Tabindex|Checks for elements with positive `tabindex` values, which cause issues for people relying on assistive tech
Visual|Image descriptions|Check that all images have `alt` text, or are within `<figure>` elements that contain a `<figcaption>`. This will also throw a warning if large images are found with empty `alt` text, which could indicate a development error
Visual|Colour contrast|Look at all text and check the colour contrast ratio is at least 3:1 for large text or 4.5:1 for regular text, as detailed in the [Web <abbr title="Accessibility in Mind">AIM</abbr> Colour Contrast Checker](https://webaim.org/resources/contrastchecker/)
Visual|Toggle CSS|Toggle all CSS (found in external stylesheets, `<style>` blocks, or inline `style` attributes) on or off on the page
Visual|Video captions|Ensure that `<video>` tags contain at least one set of captions of the type `captions`, `subtitles`, or `descriptions`
Visual|Autoplay video|Check for any `<video>` elements with the `autoplay` attribute set
Visual|Low vision (blur)|Applies a blur filter to the page to simulate poor vision
Visual|Colour blindness (all)|Applies a colour blindness simulation filter to the page. Only one colour blindness filter can be applied at any one time
Visual|Reset filters|Remove any blur or colour blindness filters currently applied
Audible|Audio captions|Ensure that any `<audio>` tags contain at least one set of captions of the type `captions`, `subtitles`, or `descriptions`
Audible|Autoplay audio|Check for any `<audio>` elements with the `autoplay` attribute set

## Planned Updates

* Improved error output and better messaging when there's no error to show
* Publishing this as a full plugin
* More tests (obviously)