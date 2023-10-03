#!/bin/bash 
id=$(date '+%Y.%m.%d.%H.%M.%S')
echo "$id"
git add .
git commit -m "v.$id"
git push

