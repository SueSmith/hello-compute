#!/bin/bash
# This script runs when you hit the Publish button!

PROJECT="${GITHUB_USER}-${RepositoryName}-origin"
printf '🚨 This action will deploy a Compute app to your Fastly account – do you want to proceed? (y/n)? '
read answer

if [ "$answer" != "${answer#[Yy]}" ] ; then 
    if [ ! $FASTLY_API_TOKEN ]; then 
        echo '⚠️ Grab an API key and add it your repo before deploying! Check out the README for steps. 📖' 
    else 
        if [ ! -d './origin/_app' ]; then
            cd origin
            npx --yes @fastly/compute-js-static-publish@latest --root-dir=dist --output=._app --kv-store-name="${PROJECT}-content" --name="${PROJECT}"
        else 
            # if we have an app folder for a different repo (e.g. a fork) recreate the folder
            name=$(grep '^name' ./origin/_app/fastly.toml | cut -d= -f2-)
            if [ $name != \"${PROJECT}\" ]; then 
                rm -rf ./origin/_app
                cd origin
                npx --yes @fastly/compute-js-static-publish@latest --root-dir=dist --output=_app --kv-store-name="${PROJECT}-content" --name="${PROJECT}"
            fi
        fi
        # check for a service id and if not deploy the app
        service=$(grep '^service_id' ./origin/_app/fastly.toml | cut -d= -f2-)
        size=${#service}
        if ! [[ ${size} -gt 3 ]]; then
            cd origin/_app
            npx --yes @fastly/cli compute publish --domain=${PROJECT}.edgecompute.app --accept-defaults --auto-yes || { echo 'Oops! Something went wrong deploying your app.. 🤬'; exit 1; }
        fi
        cd ./origin/_app
        npm run fastly:publish || { echo 'Oops! Something went wrong deploying your app.. 🤬'; exit 1; }

        cd ../../
        if ! grep -wq "setup.backends.website" fastly.toml; then 
            echo -e "\n[setup]\n    [setup.backends]\n      [setup.backends.website]\n          address = \"${PROJECT}.edgecompute.app\"" >> fastly.toml
        fi
        npm run build
        npm run deploy || { echo 'Oops! Something went wrong deploying your app.. 🤬'; exit 1; }
        readarray -t lines < <(npm run domain)
        read -r -a array <<< "${lines[5]}"
        printf "\nWoohoo check out your site at https://${array[2]} 🪩 🛼 🎏\n\n"
    fi
else
    exit 1
fi
