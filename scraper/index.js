const cheerio = require("cheerio");
const axios = require("axios");
const result = []

const url = "https://www.allbeauty.com/gb/en/catalogue/fragrance/-/-/-/-/her/";

const scrapePage = async () => {
    const getHTML = async (url) => {
        const { data } = await axios.get(url);
        return cheerio.load(data);
    };

    const $ = await getHTML(url);
    const pagesNumber = $('#searchPaginationBottom > nav > a:nth-child(6)').eq(-1).text()

    for (let i = 0; i < pagesNumber; i++) {
        const selector = await getHTML(
           `https://www.allbeauty.com/gb/en/catalogue/fragrance/-/-/-/-/her?page=${i}`
        );
        let elements = selector('#searchResults').children()

        for (const el of elements){
            const link = selector(el)
                .find('a:nth-child(4)')
                .attr('href')
            const itemSelector = await getHTML(link)
            const item = itemSelector('body > div.wrapper')
            const title = item.find('#productDetails > h1 > span:nth-child(1)')
                .text()
            const price = item.find('#productDetails > div.prices > div.price-stars.flex > p.our-price.my0.mr5')
                .text()
            const regPrice = item.find('#productDetails > div.prices > p > span.rrp')
                .text()
            const save = item.find('#productDetails > div.prices > p > span.saving.db.red2')
                .text()
            const details = item.find('#descriptionTabContent > p')
                .text()
            const reviewsCount = item.find('#productDetails > div.prices > div.price-stars.flex > div.flex.star-container > span')
                .text()
            const images = []
            item.find('#product-thumbnails').children().each(function (i, el){
                    images.push($(el).find('img').attr('src'))
            })
            !images.length && images.push(
            item.find('#product-image-default').attr('src')
            )
            const delivery = []
            item.find('#deliveryTabContent').children().each(function (i, el){
                const deliveryServices = {}
                deliveryServices.service = $(el).find('p.delivery-type > span > b').text()
                deliveryServices.shipping_cost = $(el).find('p.delivery-price > b').text()
                deliveryServices.delivery_aim = $(el).find('p.delivery-expectation').text()
                delivery.push(deliveryServices)
            })
            delivery.shift()

            const product = {
                product_name: title,
                product_url: link,
                product_images: images,
                product_price: price,
                product_regular_price: regPrice,
                save: save?.split(' ')[1],
                save_percentage: save?.split(' ')[2].replace(/[()]/g, "").trim(),
                product_details:details,
                delivery,
                product_rating:'5 stars',// TODO dynamic type. Can't be scraped by static methods
                reviews_count: Number(reviewsCount.replace(/[()]/g, "")),
            }
            result.push(product)
            // console.log(result)     // to check progress
        }

        }
    return result
}
scrapePage()
