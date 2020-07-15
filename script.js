function buildQuotazo(imageURL, quote){
    console.log("buildQuotazo ran");
}

function getRandomImage(quote) {
    console.log("getRandomImage ran");
}

function getRandomQuote() {
    console.log("getRandomQuote ran");
}

function showRandomQuotazo() {
    const quote = getRandomQuote();
    const imageURL = getRandomImage(quote);
    buildQuotazo(imageURL, quote);
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