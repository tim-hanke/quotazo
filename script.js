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

// generic function for any errors
// shows a jokey error message image instead of a quotazo
function showErrorImage() {
    $('.quotazo-image').attr({src:"images/error.jfif", alt:"Ooops! I couldn't find a fresh quote for you. Maybe the Internet is down! Please try again later. - Quotazo"});
    $('.quotazo-image').removeClass('hidden');
    const html = `Photo by <a href="https://unsplash.com/@maxchen2k?utm_source=quotazo&utm_medium=referral">Max Chen</a> on <a href="https://unsplash.com/?utm_source=quotazo&utm_medium=referral">Unsplash</a>`
    $('.attribution').html(html);
}

// this creates a simple attribution link for the photographer
// of the image and inserts it into the DOM
// unsplash's API documentation says it's recommended,
// not required, but it definitely seems like best practices
function showAttribution(image) {
    const html = `Photo by <a href="${image.userlink}?utm_source=quotazo&utm_medium=referral">${image.username}</a> on <a href="https://unsplash.com/?utm_source=quotazo&utm_medium=referral">Unsplash</a>`
    $('.attribution').html(html);
}

// this produces a formatting string to pass via URL to unsplash
// to have the image served in the correct dimensions
// I also added a duotone effect to match the image better to
// the background of the quote's text box
function getSizingString() {
    const params = {
        fm: "jpg",
        w: "1080",
        ar: "1:1",
        fit: "crop",
        crop: "faces,entropy",
        // "blend-color": "50000000",
        duotone:"000000,002228",
        "duotone-alpha":"25"
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
        txtclr: "fff",
        txt: quote,
        txtsize: "60",
        txtlead:"0",
        txtpad:"60",
        "txt-shad": "5",
        bg:"85002228",
        txtfont:"HelveticaNeue-Thin"
    }    
    const formattingString = formatQueryParams(paramsBox);
    const alignString = "center,middle"
    const quoteURL = `mark64=${btoa(textEndpointURL + '?' + formattingString)}&markalign64=${btoa(alignString)}`;
    // console.log(quoteURL);
    return quoteURL;
    // https://assets.imgix.net/~text?w=600&txtclr=fff&txt=“Sometimes+when+you+innovate,+you+make+mistakes.+It+is+best+to+admit+them+quickly,+and+get+on+with+improving+your+other+innovations.” — Steve Jobs&w=900&txtsize=40&txtlead=0&txtpad=60&bg=55002228&txtfont=HelveticaNeue-Thin
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
    $('.quotazo-image').removeClass('hidden');
}

async function getRandomImage(quote) {
    // console.log(`getRandomImage ran with quote: ${quote}`);
    const params = {
        // client_id: apiKey,
        // I'm now including the API key in the header instead of URL
        // orientation: "squarish",
        // even with non-squarish images, the imgix crop function
        // does a good good of centering the interesting parts
        // of the image, and removing "squarish" widens
        // the pool of results
        query: quote,
    }
    const queryString = formatQueryParams(params);
    const url = randomImageURL + '?' + queryString;
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
        description:""
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
        image.description = responseJson.description;
    })
    .catch(err => {
        showErrorImage();
        // alert(`Something went wrong: ${err.message}`);
    })
    // console.log(image.rawurl);
    // the function returns just the data I use, instead of the
    // whole json response
    return image;
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
        // so I'm using trin() to remove them
        return `${response.quoteText.trim()} - ${response.quoteAuthor.trim()}`;
    } catch (err) {
        showErrorImage();
    }
}

async function getSpecificImage(id) {
    const url = specificImageURL + id;
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
        description:""
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
        image.description = responseJson.description;
    })
    .catch(err => {
        showErrorImage();
        // alert(`Something went wrong: ${err.message}`);
    })
    // console.log(image.rawurl);
    // the function returns just the data I use, instead of the
    // whole json response
    return image;
}

// I seperated the retrieving of random quotes and images
// from the image generator to make it easier to later add
// the ability to generate an image (a quotazo) from a
// selected background image or user entered quote
async function showRandomQuotazo() {
    const quote = await getRandomQuote();
    const image = await getRandomImage(quote);
    if (quote && image) {
        // console.log(`id:${image.id}`);
        // console.log(`quote:${encodeURIComponent(quote)}`);
        buildQuotazo(image, quote);
        showAttribution(image);
    } else {    
        showErrorImage();    
        // $('.js-error-message').text("Something happened. Try again.");
        // $('.js-error-message').show();
        // todo: hide image and caption
    }
}

// When "random" button is clicked, called showRandomQuotazo
function watchRandomButton() {
    $('.randomButton').click(e => {
        // console.log("random button clicked");
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
        // console.log(`${image}, ${quote}`)
        const image = await getSpecificImage(decodeURIComponent(urlParams.get('id')));
        buildQuotazo(image, quote);
        showAttribution(image);
    }
}

$(function() {
    // console.log("we're loaded")
    checkURLParams();
    watchRandomButton();
})