const quoteSearchURL = "https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp&jsonp=jsonpCallback";
const imageAPIURL = "https://api.unsplash.com/photos/random";
const apiKey = "2J86Mb_dvHxogT4Z-EpAk-Zo3BV6Z2KAE64u0wJKIc4"

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function showAttribution(image) {
    const html = `Photo by <a href="${image.userlink}?utm_source=quotazo&utm_medium=referral">${image.username}</a> on <a href="https://unsplash.com/?utm_source=quotazo&utm_medium=referral">Unsplash</a>`
    $('.attribution').html(html);
}

function getSizingString() {
    const params = {
        fm: "jpg",
        w: "1080",
        ar: "1:1",
        fit: "crop",
        crop: "entropy"
    }
    const sizingString = formatQueryParams(params);
    return sizingString;
}

function getQuoteString(quote) {
    const textEndpointURL = "https://assets.imgix.net/~text";
    const paramsBox = {
        w: "900",
        txtclr: "fff",
        txt: quote,
        txtsize: "60",
        txtlead:"0",
        txtpad:"60",
        "txt-shad": "5",
        bg:"55002228",
        txtfont:"HelveticaNeue-Thin"
    }    
    const formattingString = formatQueryParams(paramsBox);
    const alignString = "center,middle"
    const quoteURL = `mark64=${btoa(textEndpointURL + '?' + formattingString)}&markalign64=${btoa(alignString)}`;
    console.log(quoteURL);
    return quoteURL;
    // https://assets.imgix.net/~text?w=600&txtclr=fff&txt=“Sometimes+when+you+innovate,+you+make+mistakes.+It+is+best+to+admit+them+quickly,+and+get+on+with+improving+your+other+innovations.” — Steve Jobs&w=900&txtsize=40&txtlead=0&txtpad=60&bg=55002228&txtfont=HelveticaNeue-Thin
}

function buildQuotazo(image, quote){
    const sizingString = getSizingString();
    const quoteString = getQuoteString(quote);
    const url = image.rawurl + '&' + sizingString + '&' + quoteString;
    $('.quotazo-image').attr({src:url, alt:image.description});
    $('.quotazo-image').removeClass('hidden');
}

async function getRandomImage(quote) {
    console.log(`getRandomImage ran with quote: ${quote}`);
    const params = {
        // client_id: apiKey,
        orientation: "squarish",
        query: quote,
    }
    const queryString = formatQueryParams(params);
    const url = imageAPIURL + '?' + queryString;
    const options = {
        headers: new Headers({
          "Authorization": `Client-ID ${apiKey}`,
          "Accept-Version": "v1"
        }),
        mode: "cors"
    };
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
        alert(`Something went wrong: ${err.message}`);
    })
    console.log(image.rawurl);
    return image;
}

function jsonpCallback(response) {
    // console.log(response.quoteText);
    // console.log(response.quoteAuthor);
    // return response.quoteText;
}

async function getRandomQuote() {
    try {
        let quote;
        await $.ajax({
            url: quoteSearchURL,
            dataType: "jsonp",
            jsonpCallback: "jsonpCallback"
        })
        .then(response => {
            quote = `${response.quoteText}- ${response.quoteAuthor}`;
        })
        return quote;
    } catch (err) {
        console.error(err);
    }
}

async function showRandomQuotazo() {
    const quote = await getRandomQuote();
    const image = await getRandomImage(quote);
    buildQuotazo(image, quote);
    showAttribution(image);
}

function watchRandomButton() {
    $('.randomButton').click(e => {
        console.log("random button clicked");
        showRandomQuotazo();
    });
}

$(function() {
    console.log("we're loaded")
    watchRandomButton();
})