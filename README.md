# Quotazo
## Create beautiful, shareable images from famous quotes

https://tim-hanke.github.io/quotazo/

![quotazo-square-tiny](https://user-images.githubusercontent.com/64292589/89131967-c61f7500-d4de-11ea-979e-0497f3370c3a.jpg)

Quotazo generates high-quality, meme-like "quotazos" by pairing a famous, inspirational and/or amusing quote with a related image. The user can then download the image, share a link via email, Facebook or LinkedIn, or get a pre-made Instagram style caption.

Quotazo is made with HTML, CSS, JavaScript, and jQuery. It pulls a random quote from the Forismatic.com quote API, and uses that quote as a query to search for an image using the Unsplash.com API. It then uses the imgix.com API text endpoint and imgix.com formatting parameters to turn the quote text into an image, which is overlaid on the Unsplash image. No images are pre-made or saved on the server, but specific image/quote combinations can be sent as links and rebuilt by Quotazo using URL parameters.
