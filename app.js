const puppeteer = require('puppeteer');
const fs = require('fs');
const XLSX = require('xlsx');

const Crawler = async (section) => {
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

    
  // Select category page and navigate to it
  await page.goto(`https://www.paodeacucar.com/secoes/${section}/`);
  await page.waitFor(5000);
    
  // Scroll to bottom of the page
  await page.evaluate(scrollToBottom);

  // Getting all products names and prices
  let productsData = await page.evaluate(() => {
    let products = [];
    // Get products category
    let breadcrumb = document.querySelector('ol.breadcrumb');
    let category = breadcrumb.querySelector('li.active');
    // Get all products elements
    let prodsElms = document.querySelectorAll('div.thumbnail');
    // Loop over product and get its data
    prodsElms.forEach(prodEl => {
      let prodJson = {};
      try {
        prodJson.name = prodEl.querySelector('p.product-description').textContent.trim();
        prodJson.category = category.textContent.trim();
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

  
  let categoryName = productsData[0].category;
  let categoryFileName = categoryName.split(' ').join('-');


  // Write excel file
  const excelData = XLSX.utils.json_to_sheet(productsData);
  const excelSheet = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(excelSheet, excelData, categoryName);
  XLSX.writeFile(excelSheet, `./data/${categoryFileName}.xlsx`);

  // Write txt file
  const productsString = JSON.stringify(productsData);
  fs.writeFile(`./data/${categoryFileName}.txt`, productsString, (err) => {
    if (err) throw err;
    console.log('The file has been saved');
  })

  // Closing app
  console.log(`Done with ${categoryName}`);
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

const sections = ['C7207', 'C4233', 'C4215', 'C4226', 'C4229', 'C4223', 'C4231', 'C4205', 'C4222', 'C4227'];

async function App() {
  const promises = sections.map(async (section) => {
    await Crawler(section)
  });

  await Promise.all(promises);

  console.log('Finished!')
}

App();