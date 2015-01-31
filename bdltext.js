#! /usr/bin/env node

/*
*  Command line app to download Shakespeare texts
*  from the First Folio site
*/

// packages
var program = require('commander');
var request = require('request');
var fs      = require('fs');
var spawn   = require('child_process').spawn;

var data = process.cwd() + '/data';

var makeDataDir = function () {
  if(! fs.existsSync(data) ) {
    fs.mkdirSync(data);
  }
}

program
   .version('0.0.1')
   .option('-f, --fetch [textshortcode]', 'Download the text')
   .option('-l, --list', 'List all stored texts')
   .option('-s, --search', 'List texts that are available for download')
   .option('-r, --remove [textshortcode]', 'Remove the local copy of the file') 
   .parse(process.argv)

   makeDataDir();

   if ( program.fetch ) {
       var code = program.fetch;
       //@todo check the short url against a list of FF Shakespeare texts
       (code.substring(0,1) == "A" ) ? download_git(code) : download_url(code);
    } else if ( program.list ) {
       console.log(listfiles());
    } else if ( program.search ) {
       console.log(listtexts().toString());
    } else if ( program.remove ) {
       var code = program.remove;
       //@todo check the short url against a list of FF Shakespeare texts
       (code.substring(0,1) == "A" ) ? deleteFolderRecursive(code) : removeXmlFile(code);        
    } else {
       console.log("Error with " + cmd.textshortcode);
    }

/**
*  Function to list the files
*/
function listfiles() {
    var files_ = [];
    var files = fs.readdirSync('./data');
    files.forEach(function (i) {
       files_.push(i);
    });

    return (files_.length) ? files: 'No files are stored';
}
/**
*  Function to remove a raw XML file
*/
function removeXmlFile (code) {
        var file_ = data + '/' + program.remove + '.xml';
        fs.exists(file_, function(exists) {
          if (exists) {
            fs.unlinkSync(file_);
            console.log(program.remove + ' has been deleted');
          } else {
            console.log(program.remove + ' does not exist');
          }
       });
}

/**
*  Read the data list
*/
function listtexts () {
   var texts_ = []
   var tmp_ = JSON.parse(fs.readFileSync('list.json', 'utf-8'));
   tmp_.texts.forEach( function (item) {
       texts_.push('\n(' + item.id + ') ' + item.title);
   });
   return texts_;
}

/**
* Function to remove a directory
*/
function deleteFolderRecursive (path) {
  var tmppath_ = (path.substring(0,1) == "A") ? data + '/' + path : path;

  if( fs.existsSync(tmppath_) ) {
    fs.readdirSync(tmppath_).forEach(function(file,index){
      var curPath = tmppath_ + "/" + file;
      (fs.lstatSync(curPath).isDirectory()) ? deleteFolderRecursive(curPath) : fs.unlinkSync(curPath);
    });
    fs.rmdirSync(tmppath_);
  }
};

/**
* Function to download the XML from the First Folio web site.
* This method will go if the Git location is updated with the line numbers
*/
function download_url(shortcode) {
       
       var ffurl = "http://firstfolio.bodleian.ox.ac.uk/download/xml/F-"+ shortcode + ".xml";

       request({
           method: 'GET',
           url: ffurl
       }, function(error, response, body) {

           if (!error && response.statusCode == 200) {
              var body = body;
              fs.writeFile(data + '/' + shortcode + '.xml', body, function(err) {
                 if(err) {
                     console.log(err);
                 } else {
                     console.log("The file was saved!");
                 }
              }); //end fs
           } else if (error) {
              console.log('BDLText Error: ' + error);
           }
       });
}

/**
*  Function to download the TCP texts from Github
*/
function download_git(shortcode) {
    
    move_dir('./data');
    
    var git_url = "https://github.com/textcreationpartnership/" + shortcode + ".git";
    var git = spawn('git', ['clone', git_url]);
     
    git.stderr.on('data', function (data) {
       console.log('BDLText error: ' + data);
    });   
    
    move_dir('../');
}

/**
*  Function to change directory for Git process
*/
function move_dir(directory) {

  try {
    process.chdir(directory);
  }
  catch (err) {
    console.log('chdir: ' + err);
  }
}
