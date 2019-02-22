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

### The Tests

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

## Planned Updates

* Improved error output and better messaging when there's no error to show
* Publishing this as a full plugin
* More tests (obviously)