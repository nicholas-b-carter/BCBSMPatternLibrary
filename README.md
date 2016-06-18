BCBSM UI Design Library
==============

- [View the UI Design Library](https://nicholas-b-carter.github.io/BCBSMPatternLibrary/)
- [Contributing](CONTRIBUTING.md)
- [How-to: Using the UI Design Library in your project](howto.md)
- [License](LICENSE)

Have feedback or questions about the UI Design Library? [Create an issue!](https://github.com/nicholas-b-carter/BCBSMPatternLibrary/issues)

#### About this repository

This is the source code repository for the [BCBSM UI Design Library](https://nicholas-b-carter.github.io/BCBSMPatternLibrary/). The site is powered by [Jekyll](http://jekyllrb.com/), a static site generator that plays well with [Github Pages](https://help.github.com/articles/using-jekyll-with-pages/). 

#### Want to contribute?
See our [CONTRIBUTING.md](CONTRIBUTING.md) file for contribution guidelines.

---

### Building & running locally
You will need to [install Jekyll](http://jekyllrb.com/docs/installation/). You will also need to [install Node.js](http://nodejs.org/download/). Node.js powers the front-end build and dependency management tools [Grunt](http://gruntjs.com/) and [Bower](http://bower.io/).

Once Jekyll and Node.js are installed, ensure you have Grunt and Bower installed globally with:
```
npm install grunt-cli -g
npm install bower -g
```

Then install the project's dependencies with:
```
npm install
bower install
```
---
#### Running the documentation
Build the front-end assets (SASS/CSS/JS) with:
```
gulp build
```
This starts Jekyll, which compiles the markdown files into static html files, starts a server for you to view the documentation at, as well as watches for changes and recompiles. 


##### Distribution Builds
After running `gulp build`, you will have a `_site` folder that contains the entire static site and resources. 
