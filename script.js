const quoteSearchURL = "https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp";
const randomImageURL = "https://api.unsplash.com/photos/random";
const specificImageURL = "https://api.unsplash.com/photos/"
const textEndpointURL = "https://assets.imgix.net/~text";
const apiKey = "2J86Mb_dvHxogT4Z-EpAk-Zo3BV6Z2KAE64u0wJKIc4"

// the same formatting I used in me last project to
// make the parameters URL safe
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function showQuotazo() {
    $('.quotazo-display').removeClass('hidden');
    $('.tagline').addClass('hidden');
}

// generic function for any errors
// shows a jokey error message image instead of a quotazo
function showErrorImage() {
    $('.quotazo-image').attr({src:"images/error.jfif", alt:"Ooops! I couldn't find a fresh quote for you. Maybe the Internet is down! Please try again later. - Quotazo"});
    const html = `Photo by <a href="https://unsplash.com/@maxchen2k?utm_source=quotazo&utm_medium=referral">Max Chen</a> on <a href="https://unsplash.com/?utm_source=quotazo&utm_medium=referral">Unsplash</a>`
    $('.attribution').html(html);
    showQuotazo();
}

// this creates a simple attribution link for the photographer
// of the image and inserts it into the DOM
// unsplash's API documentation says it's recommended,
// not required, but it definitely seems like best practices
function buildAttribution(image) {
    const html = `Photo by <a href="${image.userlink}?utm_source=quotazo&utm_medium=referral">${image.username}</a> on <a href="https://unsplash.com/?utm_source=quotazo&utm_medium=referral">Unsplash</a>`
    $('.attribution').html(html);
}

function buildDownload() {
    const url = $('.quotazo-image').attr("src") + "&dl";
    $('#download').attr("href",url);
}

function buildShareLink (image, quote) {
    const searchParams = {
        id: image.id,
        q: quote
    }
    return `https://tim-hanke.github.io/quotazo/index.html?${formatQueryParams(searchParams)}`;
}

function buildEmail(link) {
    const emailParams = {
        subject: "Check out this Quotazo!",
        body: link
    }
    const url = "mailto:?" + formatQueryParams(emailParams);
    console.log(url);
    $('#email').attr("href",url);
}

function buildSharingLinks(image, quote) {
    buildDownload();
    const shareLink = buildShareLink(image, quote);
    buildEmail(shareLink);
    // buildFacebook(image, quote);
    // buildLinkedIn(image, quote);
    // buildInstagram(image, quote);
}

// this produces a formatting string to pass via URL to unsplash
// to have the image served in the correct dimensions
function getSizingString() {
    const params = {
        fm: "jpg",
        auto: "format",
        w: "1080",
        ar: "1:1",
        fit: "crop",
        crop: "entropy",
        // border: `10,${bdrColor}`
        // duotone:"000000,002228",
        // "duotone-alpha":"25"
    }
    const sizingString = formatQueryParams(params);
    return sizingString;
}

// this uses the imgix text endpoint to make an image out of
// the quote, which will be overlaid on the unsplash image
// it also encodes the string of parameters in base64 per
// the imgix documentation
function getQuoteString(quote) {
    const paramsBox = {
        w: "900",
        txtclr: "ffffee",
        txt: quote,
        txtsize: "60",
        txtlead:"0",
        txtpad:"60",
        "txt-shad": "5",
        bg:"99000000",
        txtfont:"HelveticaNeue-Thin"
    }    
    const formattingString = formatQueryParams(paramsBox);
    const alignString = "center,middle"
    const quoteURL = `mark64=${btoa(textEndpointURL + '?' + formattingString)}&markalign64=${btoa(alignString)}`;
    return quoteURL;
}

// the sizing/cropping of the background image, and the formatting/insertion
// of the quote are all done through URL parameters, so this combines strings
// for both of those with the raw image URL from unsplash and inserts it
// into the DOM
function buildQuotazo(image, quote){
    const sizingString = getSizingString();
    const quoteString = getQuoteString(quote);
    const url = image.rawurl + '&' + sizingString + '&' + quoteString;
    $('.quotazo-image').attr({src:url, alt:image.description});
}

async function fetchUnsplashImage(url) {
    const options = {
        headers: new Headers({
          "Authorization": `Client-ID ${apiKey}`,
          "Accept-Version": "v1"
        }),
        mode: "cors"
    };
    // this is an object for the bits of the response I'm interested in
    const image = {
        id:"",
        rawurl:"",
        userlink:"",
        username:"",
        description:"",
        // bdrColor: ""
    }
    await fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(responseJson => {
        image.id = responseJson.id;
        image.rawurl = responseJson.urls.raw;
        image.userlink = responseJson.user.links.html;
        image.username = responseJson.user.name;
        image.description = (responseJson.description ? responseJson.description : responseJson.alt_description);
        // image.bdrColor = "75" + responseJson.color.slice(1);
    })
    .catch(err => {
        showErrorImage();
    })
    return image;
    // the function returns just the data I use, instead of the
    // whole json response

}

async function getRandomImage(quote) {
    const params = {
        query: quote,
    }
    const queryString = formatQueryParams(params);
    const url = randomImageURL + '?' + queryString;
    return await fetchUnsplashImage(url);
}

// the forismatic.com API doesn't return a Access-Control-Allow-Origin
// header, in other words it doesn't do CORS, so I'm retrieving it
// using jQuery.ajax
async function getRandomQuote() {
    try {
        const response = await $.ajax({
            url: quoteSearchURL,
            dataType: "jsonp",
            jsonp: "jsonp"
        });
        // the quote data sometimes comes with extraneous spaces,
        // so I'm using trim() to remove them
        // also, sometimes the author field is blank. If so,
        // we'll substitute in "Unknown"
        return `${response.quoteText.trim()} - ${(response.quoteAuthor ? response.quoteAuthor.trim() : "Unknown")}`;
    } catch (err) {
        showErrorImage();
    }
}

async function getSpecificImage(id) {
    const url = specificImageURL + id;
    return await fetchUnsplashImage(url);
}

// I seperated the retrieving of random quotes and images
// from the image generator to make it easier to later add
// the ability to generate an image (a quotazo) from a
// selected background image or user entered quote
async function showRandomQuotazo() {
    const quote = await getRandomQuote();
    const image = await getRandomImage(quote);
    // console.log(image);
    if (quote && image) {
        buildQuotazo(image, quote);
        buildAttribution(image);
        buildSharingLinks(image, quote);
        showQuotazo();
    } else {    
        showErrorImage();    
    }
}

// When "random" button is clicked, called showRandomQuotazo
function watchRandomButton() {
    $('.randomButton').click(e => {
        showRandomQuotazo();
    });
}

// checks if URL parameters exist for an image id and a 
// quote, and if they do, build and displays a quotazo
// using them
async function checkURLParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('q') && urlParams.has('id')) {
        const quote = decodeURIComponent(urlParams.get('q'));
        const image = await getSpecificImage(decodeURIComponent(urlParams.get('id')));
        if (quote) {
            buildQuotazo(image, quote);
            buildAttribution(image);
            buildSharingLinks(image, quote);
            showQuotazo();
        } else {
            showErrorImage();
        }
    }
}

$(function() {
    checkURLParams();
    watchRandomButton();
})