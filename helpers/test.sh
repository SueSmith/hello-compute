#!/bin/bash

npm run domain
readarray -t lines < <(npm run domain)
printf "hi ${lines[5]}"
read -r -a array <<< "${lines[5]}"
printf "\nWoohoo check out your site at https://${array[2]} 🪩 🛼 🎏\n\n"