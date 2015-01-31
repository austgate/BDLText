BDLText
-------

###Overview

This is a brief command line application to download texts from the Text Creation
Partnership github account or the Bodleian's First Folio site.

It is very loosely based on package managers such as npm, aptitude or yum.

It can be run with either ./bdltext.js [options], or symlinked and run as bdltext
after the 
     npm install -g
command is run.

It is under development so might break.

###Commands

     -f, --fetch [short code]  This fetches the XML document
     -r, --remove [short code] This removes the text from the download location
     -l, --list                This lists the downloaded documents by short code
     -s, --search              This lists texts that are available for download

###Copyright
2015, Iain Emsley, University of Oxford
