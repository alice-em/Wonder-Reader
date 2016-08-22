/* file.js
/  loads files into the program,
/  extracting and sourcing images
/  to where they need to go. */

var fs = require('fs');
const {dialog} = require('electron').remote;
var unrar = require('node-unrar'); // https://github.com/scopsy/node-unrar
const $ = require('jquery');
var mkdirp = require('mkdirp'); // https://github.com/substack/node-mkdirp
var path = require('path');
var extract = require('extract-zip'); // https://www.npmjs.com/package/extract-zip
var directoryExists = require('directory-exists'); // https://www.npmjs.com/package/directory-exists
var libWatch = require('./js/libwatch.js'); // libWatch.load(fileName) loads into #library.ul
var nextcomic = require('./js/nextcomic.js'); // Loads Functions onto previous and next buttons
var page = require('./js/page.js');
// var openFile = require('./js/openfile.test.js');
// var validChar = '/^([!#$&-;=?-[]_a-z~]|%[0-9a-fA-F]{2})+$/g';

var imgTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']; // Allowable File Types

function openFile() {
  dialog.showOpenDialog(
    { filters: [{
      name: 'Comic Files',
      extensions: ['cbr', 'cbz']
      }]
    },

    // Open File function
    function(fileNames) {
      if (fileNames === undefined) return; // Breaks on error
      var fileName = fileNames[0]; // Filepath name
      filePiper(fileName); // Extracts files to their proper locations
		}
  );
};

function filePiper(fileName, err) { // checks and extracts files and then loads them
  if (err) {
    handleError(err);
  };

  // Folder Creation
  if ([".cbr", ".cbz"].indexOf(path.extname(fileName).toLowerCase()) > -1) {
    var fileComic = path.posix.basename(fileName).replace(/#/g, ""); // Function removes path dir, spaces, and '#'. Good to note!
    if (process.platform == 'win32') {
      fileComic = path.win32.basename(fileName).replace(/#/g, "");
    }
  } else {
    handleError(evt)
  }

  var tempFolder = path.join("app", "cache", fileComic); // tempFolder Variable for loaded comic

  if (directoryExists.sync(tempFolder)) { // Checks for existing Directory
    console.log(tempFolder + " previously created.")
    var dirContents = fs.readdirSync(tempFolder);
    var filtered = [];
    for(i=0; i < dirContents.length; i++) {
      if(imgTypes.indexOf(path.extname(dirContents[i]).toLowerCase()) > -1 || fs.statSync(path.join(tempFolder,dirContents[i])).isDirectory()) {
        filtered.push(dirContents[i]);
        console.log(dirContents[i] + " pushed in")
      } else {
        console.log(dirContents[i] + " rejected!")
      }
    };
    dirContents = filtered;
    console.log(dirContents);
    if (fs.statSync(path.join(tempFolder, dirContents[0])).isDirectory()) { // If there is an interior directory
      console.log(dirContents[0] + " is a directory. Moving into new directory.")
      fileComic = path.join(fileComic, encodeURIComponent(dirContents[0]));
      dirContents = fs.readdirSync(path.join(tempFolder, dirContents[0]));
      dirContents = dirContents.filter(function(x, i) {
        return imgTypes.indexOf(path.extname(dirContents[i]).toLowerCase()) > -1
      });
      console.log(path.join(tempFolder, dirContents[0]));
    } else { // if no interior directory exists
      dirContents = dirContents.filter(function(x, i) {
        return imgTypes.indexOf(path.extname(dirContents[i]).toLowerCase()) > -1
      });
      console.log(dirContents[0]);
    };
    document.getElementById("viewImgOne").src = path.join('cache', fileComic, encodeURIComponent(dirContents[0]));
    document.getElementById("viewImgTwo").src = path.join('cache', fileComic, encodeURIComponent(dirContents[1]));

    postExtract(fileName);

  } else { // If no Directory exists
    mkdirp.sync(tempFolder);

    // -----------------------
    // .CBR file type function
    // -----------------------
    if (path.extname(fileName).toLowerCase() == ".cbr") {
      var rar = new unrar(fileName);
      rar.extract(tempFolder, null, function (err) {
        var dirContents = fs.readdirSync(tempFolder);

        dirContents = dirContents.filter(function(x, i) {
          return imgTypes.indexOf(path.extname(dirContents[i]).toLowerCase()) > -1
        });
        // Cleans out the crap :: see imgTypes[...] @ line 12

        console.log(dirContents)

        $('#loader').addClass('hidden').removeClass('loader');
        $('#bgLoader').addClass('hidden');

        document.getElementById("viewImgOne").src = path.join('cache', fileComic, encodeURIComponent(dirContents[0])); // Loads array[0] into window
        document.getElementById("viewImgTwo").src = path.join('cache', fileComic, encodeURIComponent(dirContents[1])); // Loads array[1] into window

        postExtract(fileName);
      });

    // -----------------------
    // .CBZ file type function
    // -----------------------
    } else if (path.extname(fileName).toLowerCase() == ".cbz") {
      extract(fileName, {dir: tempFolder}, function(err) {
        var dirContents = fs.readdirSync(tempFolder);

        // To clean out other files and check for folders
        var filtered = [];
        for(i=0; i < dirContents.length; i++) {
          if(imgTypes.indexOf(path.extname(dirContents[i]).toLowerCase()) > -1 || fs.statSync(path.join(tempFolder,dirContents[i])).isDirectory()) {
            filtered.push(dirContents[i]);
            console.log(dirContents[i] + " pushed in")
          } else {
            console.log(dirContents[i] + " rejected!")
          }
        };

        dirContents = filtered;
        console.log(dirContents);

        // Checks for interior folders
        if (fs.statSync(path.join(tempFolder, dirContents[0])).isDirectory()) {
          fileComic = path.join(fileComic, encodeURIComponent(dirContents[0]));
          dirContents = fs.readdirSync(path.join(tempFolder, dirContents[0]));
        }

        dirContents = dirContents.filter(function(x, i) {
          return imgTypes.indexOf(path.extname(dirContents[i]).toLowerCase()) > -1
        });
        // Cleans out the non-image files :: see imgTypes[...] @ line 12

        $('#loader').addClass('hidden').removeClass('loader');
        $('#bgLoader').addClass('hidden');

        document.getElementById("viewImgOne").src = path.join('cache', fileComic, encodeURIComponent(dirContents[0])); // Loads array[0] into window
        document.getElementById("viewImgTwo").src = path.join('cache', fileComic, encodeURIComponent(dirContents[1])); // Loads array[1] into window

        postExtract(fileName)
      });

    // Neither .CBR nor .CBZ
    } else {
      handleError(evt)
    };

    // Async class adding then hidden on final load
    $('#loader').addClass('loader').removeClass('hidden');
    $('#bgLoader').removeClass('hidden');
  }; // End Directory checker
};

function enable(id) {
  document.getElementById(id).disabled = false;
};
function disable(id) {
  document.getElementById(id).disabled = true;
};

function postExtract(fileName) {
  var inner = document.getElementById('innerWindow');
  var imgOne = document.getElementById('viewImgOne');
  var imgTwo = document.getElementById('viewImgTwo');

  page.onLoad();
  enable("pageLeft");
  enable("pageRight");
  enable("column");
  libWatch.load(fileName); // libwatch.js
  nextcomic.load(fileName);

  if(imgOne.clientHeight >= imgTwo.clientHeight) {
    inner.style.height = imgOne.clientHeight + "px";
  } else {
    inner.style.height = imgTwo.clientHeight + "px";
  };
  console.log('postExtract initial inner.style.height set at: ' + inner.style.height)
};

module.exports = {
  dialog: openFile();
  loader: filePiper(fileName, err);
}
