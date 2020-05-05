const puppeteer = require('puppeteer');
const fs = require('fs');

const App = async () => {
  // Launch browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // Disable images to load faster
  await page.setRequestInterception(true);
    
    page.on('request', (req) => {
        if(req.resourceType() == 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });
  
  // Navigate to Pão de Açúcar's page
  await page.goto('https://www.paodeacucar.com/busca');
  await page.waitFor(5000);

  // Scroll to bottom of the page
  await page.evaluate(scrollToBottom);

  // Getting all products names and prices
  let productsData = await page.evaluate(() => {
    let products = [];
    // Get all products elements
    let prodsElms = document.querySelectorAll('div.thumbnail');
    // Loop over product and get its data
    prodsElms.forEach(prodEl => {
      let prodJson = {};
      try {
        prodJson.name = prodEl.querySelector('p.product-description').textContent.trim();
        if (prodEl.querySelector('p.discount-price')) {
          prodJson.oldPrice = prodEl.querySelector('s.ng-binding').textContent.trim();
          prodJson.discountPrice = prodEl.querySelector('p.discount-price').textContent.trim();
        } else {
          prodJson.price = prodEl.querySelector('p.normal-price').textContent.trim();
        }
      }
      catch (err) {

      }
      products.push(prodJson);
    });
    return products;
  })

  // Write txt file
  const productsString = JSON.stringify(productsData);
  fs.writeFile("products.txt", productsString, (err) => {
    if (err) throw err;
    console.log('The file has been saved');
  })

  // Closing app
  console.log('Done');
  await browser.close();
};

// Scroll script
async function scrollToBottom() {
  await new Promise(resolve => {
    const distance = 100; // should be less than or equal to window.innerHeight
    const delay = 100;
    const timer = setInterval(() => {
      document.scrollingElement.scrollBy(0, distance);
      if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}

App();