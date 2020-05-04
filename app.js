const puppeteer = require('puppeteer');

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
  await page.goto('https://www.paodeacucar.com/busca?qt=12&s=title&p=1&gt=list');
  await page.waitFor(5000);

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

  console.dir(productsData);

  // Testing with screenshot
  await page.screenshot({path: 'test.png'});

  // Closing app
  console.log('Done');
  await browser.close();
};

App();