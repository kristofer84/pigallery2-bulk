echo Scanning for files
echo Files
find /media/ -iname *.jp*g > /tmp/files.txt
echo ------------------
echo Processing files
node ./run.js
