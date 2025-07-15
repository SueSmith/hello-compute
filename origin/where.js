/**
 * THIS COMPONENT WRITES LOCATION INFO INTO THE PAGE
 * BASED ON A COOKIE FROM THE EDGE
 * AND DISPLAYS A FLAG EMOJI
 */

class LocationIndicator extends HTMLElement {
  // connect component
  connectedCallback() {
    let where = "";
    // If we have a cookie we'll display its content
    if (document.cookie) {
      let cookies = document.cookie.split(";");
      cookies.forEach((c) => {
        let cook = c.trim();
        // We want the "location" cookie
        if (cook.startsWith("location=")) {
          where = cook.split("=")[1];
          this.textContent = where;
        }
      });
    }

    if(where.length > 0){
      // Add a flag emoji after the country code – may cause weirdness
      let locationInfo = this.textContent.trim();
      if (locationInfo && locationInfo.length > 0) {
        let locBits = locationInfo.split(" ");
        const codePoints = locBits[locBits.length - 1]
          .toUpperCase()
          .split("")
          .map((char) => 127397 + char.charCodeAt());
        let flag = String.fromCodePoint(...codePoints);
        let message = locationInfo + "\n" + flag;
        this.textContent = message;
      }
    }
  }
}

// We'll use <location-indicator> in the page
customElements.define("location-indicator", LocationIndicator);
