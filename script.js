const quoteSearchURL = "https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp";
const randomImageURL = "https://api.unsplash.com/photos/random";
const specificImageURL = "https://api.unsplash.com/photos/"
const textEndpointURL = "https://assets.imgix.net/~text";
const apiKey = "2J86Mb_dvHxogT4Z-EpAk-Zo3BV6Z2KAE64u0wJKIc4"

// make the parameters URL safe
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

// this simply flips on the section containing the image
// and links, and hides the tagline
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
// also, since instagram doesn't have a way for normal people to post
// outside of the app, I just make an instagram style caption
// to make it easier to manually post a quotazo image
// on page load, the html caption is visible and the instagram
// style is hidden. the instagram button on the page will
// switch them back and forth
function buildCaption(image, quote) {
    let html = `<span id="html-attribution">Photo by <a href="${image.userlink}?utm_source=quotazo&utm_medium=referral">${image.username}</a> on <a href="https://unsplash.com/?utm_source=quotazo&utm_medium=referral">Unsplash</a></span>`
    html += `<span id="instagram">Photo by ${(image.userinstagram ? "@" + image.userinstagram : image.username)} on @unsplash<br>#quotazo #${quote.author.split(' ').join('').toLowerCase()} #unsplash</span>`;
    $('.attribution').html(html);
    $('.attribution').removeClass('instagram');
    $('#instagram').hide()
}

function buildDownload() {
    const url = $('.quotazo-image').attr("src") + "&dl";
    $('#download').attr("href",url);
}

function buildShareLink (image, quote) {
    const searchParams = {
        id: image.id,
        q: quote.text
    }
    return `https://tim-hanke.github.io/quotazo/index.html?${formatQueryParams(searchParams)}`;
}

function updateOpenGraph(link) {
    // so, facebook doesn't read javascript when scraping, so this
    // update is currently irrelevant
    // I'm leaving it in case that changes
    $('.og-url').attr('content', link);
    const imageURL = $('.quotazo-image').attr("src");
    $('.og-image').attr('content', imageURL);
}

function buildEmail(link) {
    const emailParams = {
        subject: "Check out this Quotazo!",
        body: link
    }
    const url = "mailto:?" + formatQueryParams(emailParams);
    $('#email').attr("href",url);
}

function buildFacebook(link) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    $('#facebook').attr("href",url);
}

function buildLinkedIn(link) {
    // https://www.linkedin.com/shareArticle?mini=true&url=
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(link)}`;
    $('#linkedin').attr("href",url);

}

// this uses the imgix text endpoint to make an image out of
// the quote, which will be overlaid on the unsplash image
// it also encodes the string of parameters in base64 per
// the imgix documentation
function getQuoteString(quote) {
    const paramsBox = {
        w: "900",
        txtclr: "ffffee",
        txt: quote.text,
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

// the sizing/cropping of the background image, and the formatting/insertion
// of the quote are all done through URL parameters, so this combines strings
// for both of those with the raw image URL from unsplash and inserts it
// into the DOM
function buildQuotazoImage(image, quote){
    const sizingString = getSizingString();
    const quoteString = getQuoteString(quote);
    const url = image.rawurl + '&' + sizingString + '&' + quoteString;
    $('.quotazo-image').attr({src:url, alt:image.description});
}    

// once we have the image object and the quote object,
// we'll insert the various pieces where we need them
// buildQuotazoImage performs the formatting of the image
// and overlays the quote
// buildCaption makes a normal html attribution and an
// instagram style caption
// buildDownload,Email,Facebook,Linkedin make links
// for the current image/quote on their various formats
function buildQuotazo(image, quote) {
    buildQuotazoImage(image, quote);
    buildCaption(image, quote);
    buildDownload();
    const shareLink = buildShareLink(image, quote);
    updateOpenGraph(shareLink);
    buildEmail(shareLink);
    buildFacebook(shareLink);
    buildLinkedIn(shareLink);
}

// whether we're retrieving a random image or a specific
// image from Unsplash, this will fetch it
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
        userinstagram: "",
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
        image.userinstagram = responseJson.user.instagram_username;
        image.description = (responseJson.description ? responseJson.description : responseJson.alt_description);
    })    
    .catch(err => {
        showErrorImage();
    })    
    return image;
    // the function returns just the data I use, instead of the
    // whole json response
}    

// we search unsplash using the quote string we retrieved
// from forismatic as the query string
// this hopefully returns us an image related to the quote
async function getRandomImage(quote) {
    const params = {
        query: quote.text,
    }
    const queryString = formatQueryParams(params);
    const url = randomImageURL + '?' + queryString;
    return await fetchUnsplashImage(url);
}

// the forismatic.com API doesn't return a Access-Control-Allow-Origin
// header, in other words it doesn't do CORS, so I'm retrieving it
// using jQuery.ajax
async function getRandomQuote() {
    const quote = {
        text: "",
        author: ""
    };
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
        quote.author = (response.quoteAuthor ? response.quoteAuthor.trim() : "Unknown");
        quote.text = `${response.quoteText.trim()} - ${quote.author}`;
        return quote;
    } catch (err) {
        showErrorImage();
    }
}

// get both a random quote and random image
// used with the Random Quote button
async function showRandomQuotazo() {
    const quote = await getRandomQuote();
    const image = await getRandomImage(quote);
    if (quote && image) {
        buildQuotazo(image, quote);
        showQuotazo();
    } else {    
        showErrorImage();    
    }
}

// get an Unsplash image using their id number
// used in conjunction with URL parameters
async function getSpecificImage(id) {
    const url = specificImageURL + id;
    return await fetchUnsplashImage(url);
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
// this allows a link to be used that will pull up the
// same image/quote pair
async function checkURLParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('q') && urlParams.has('id')) {
        const quoteText = decodeURIComponent(urlParams.get('q'));
        const quoteAuthor = quoteText.split('-')[1];
        const quote = {
            text: quoteText,
            author: quoteAuthor
        }
        const image = await getSpecificImage(decodeURIComponent(urlParams.get('id')));
        if (quote) {
            buildQuotazo(image, quote);
            showQuotazo();
        } else {
            showErrorImage();
        }
    }
}

// the instagram button swaps back and forth between the 
// regular style caption and the instagram style caption
function watchInstagramButton() {
    $('#instagram-button').click(e => {
        e.preventDefault();
        if ($('.attribution').hasClass('instagram')) {
            $('#instagram').hide();
            $('#html-attribution').show();
        } else {
            $('#instagram').show();
            $('#html-attribution').hide();
        };
        $('.attribution').toggleClass('instagram');
    })
}

// on page load, first check if URL parameters are being passed
// for a specific image/quote pair
// then load click handlers for the Random Image Button
// and the Instagram Button
$(function() {
    checkURLParams();
    watchRandomButton();
    watchInstagramButton();
})