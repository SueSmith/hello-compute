/**
 * This code runs on the Fastly Compute platform 🚀 
 */

import { getGeolocationForIpAddress } from "fastly:geolocation";
let where = "?", greeting = "Hello! ";
let root = "/";//compute-origin/"; //change the root if your site is at a different path 

// We use a function to handle requests to the origin
addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(_event) {
  //The request the user made
  let req = _event.request;
  let url = new URL(req.url);

  //Find out the user location info
  try {
    let ip =
      new URL(_event.request.url).searchParams.get("ip") ||
      _event.client.address;

    /* 
    Info you can get from geo
    https://js-compute-reference-docs.edgecompute.app/docs/fastly:geolocation/getGeolocationForIpAddress
    */
    let geo = getGeolocationForIpAddress(ip);

    // 🚧 🚧 🚧 Add the code from the README on the next line 🚧 🚧 🚧

    // Where is the user
    where =
      geo.city.charAt(0).toUpperCase() +
      geo.city.slice(1).toLowerCase() +
      " " +
      geo.country_code;

    // Set the stylesheet
    let style = root + "edge.css";

    //    url.pathname = url.pathname.replace("/", root);
    if (url.pathname.indexOf(".css") >= 0) url.pathname = style;

    // Build a new request
    req = new Request(url, req);
  } catch (error) {
    console.error(error);
    return new Response(getSynthPage("😭 500 😭", "Uh oh something went wrong on the server"), {
      status: 500,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  //Get the origin response
  let backendResponse = await fetch(req.url, {
    backend: "website"
  });

  if (url.pathname.indexOf(".json") >= 0) {
    let data = await backendResponse.json();
    let content = `<strong>${data.information}</strong>`;
    return new Response(getSynthPage("📊 DATA 📊", content), {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
  if (backendResponse.status == 404) {
    return new Response(getSynthPage("⚠️ 404 ⚠️", "Uh oh the page you requested wasn't found"), {
      status: 404,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  // Tell the user about how this response was delivered with a cookie
  backendResponse.headers.set(
    "Set-Cookie",
    "location=" + greeting + "Fastly responded to a request from " + where +
    "; SameSite=None; Secure"
  );

  return backendResponse;
}

// The synthetic page is tailored to the Glitch origin so tweak to suit your site!
function getSynthPage(heading, message) {
  // The default Glitch origin has a stylesheet called "style.css"
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
    <link rel="stylesheet" href="style.css"/>
  </head>
  <body>
    <h1>${heading}</h1>
    <p>${message}</p>
    <p>Go to <a href="/">the homepage</a></p>
  </body>
</html>`;
}
