# "Billion-dollar-o-gram" generator

The Billion-dollar-o-gram is a visualization format for monetary amounts that was first developed by David McCandeless ([see here](http://www.davidmccandless.com/design_work/#the-billion-pound-o-gram)).

The code for this app was used to make a visualization of the amounts spent on the implementation of Fortress Europe policies by the journalists of [The Migrants Files](http://themigrantsfiles.com) consortium.

![Visualization for The Migrants Files](/assets/illustration.png)

In this document, you'll find how to locally install the visualization, as well as generate translations, deploy the site and other details.

  - [Installation](#installation)
  - [Running a local web server](#running-a-local-web-server)
  - [Integrating translations](#integrating-translations)
  - [Generating static SVG versions](#generate-static-images)
  - [Pushing the site to the live server](#pushing-the-site-to-the-live-server)
  - [Showing the site in different languages](#showing-the-site-in-different-languages)
  - [Adding a new translation](#adding-a-new-translation)
  - [Iframe embed](#iframe-embed)


## Installation

After cloning the repository and `cd`ing to it, run

    make install

## Running a local web server

Simple:

    make run

## Integrating translations

Running

    make build

will pull the latest version of the shared Google Sheet and integrate all the translations available. This conversion script doesn't require any dependencies. 

After building, check if there were changes to the repo (with `git status`). If there are, commit them and deploy the changes (using `make deploy`, see below).

In case you run into an error, please file an issue and we'll head in to fix things.

## Pushing the site to the live server

In order to deploy the site to GitHub Pages, do

    make deploy

## Generate static images

In order to create static versions of the visualization, do

    make build-static

You will need to have Inkscape installed.

## Showing the site in different languages

Adding the `lang` parameter will set the language to use.

For example, the Swedish version is accessible through http://YOUR_URL?lang=sv-SE .

## Adding a new translation

See the TRANSLATING.md file for the steps needed for adding another language.

##Iframe embed

To embed the app in an iframe add the following code in the parent page.

In the body of the HTML, where you want the iframe to appear, add this code:

    <div id="your-app"></div>

    <script src="http://YOUR_URL/js/pym.min.js"></script>
    <script>var pymParent = new pym.Parent('your-app', 'http://YOUR_URL/index.html', {}); </script>
        
Pym.js will generate the `<iframe>` code inside the `<div id="your-app"></div>` div.

