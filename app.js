const puppeteer = require('puppeteer');
const fs = require('fs');
const XLSX = require('xlsx');

const App = async () => {
  // Launch browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // Disable images to load faster
  await page.setRequestInterception(true);
    
    page.on('request', (req) => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });

    
  // Navigate to Pão de Açúcar's page
  await page.goto('https://www.paodeacucar.com/secoes/C7207/carnes-maturatta?qt=12&p=0&gt=list');
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
          prodJson.price = prodEl.querySelector('s.ng-binding').textContent.trim();
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

  // Write excel file
  const excelData = XLSX.utils.json_to_sheet(productsData);
  const excelSheet = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(excelSheet, excelData, 'PDA Data');
  XLSX.writeFile(excelSheet, 'PDAData.xlsx');

  // Write txt file
  const productsString = JSON.stringify(productsData);
  fs.writeFile("PDAData.txt", productsString, (err) => {
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
    const distance = 100;
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