const puppeteer = require('puppeteer');

const App = async () => {
  // Launch browser and go to Pão de Açúcar's page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.paodeacucar.com/');

  // Go to Search page
  const [ searchButton ] = await page.$x('//*[@id="light-header"]/div[5]/div[2]/div/div[2]/search/div/form/div/div/div/span/button');
  await searchButton.click();
  await page.waitFor(5000);

  // Getting a product name and price
  const productNameEl = await page.$('p.product-description');
  const productNameTxt = await productNameEl.getProperty('textContent');
  const productNameFull = await productNameTxt.jsonValue();
  const productName = productNameFull.trim();
  console.log({productName});

  // Testing with screenshot
  await page.screenshot({path: 'test.png'});

  // Closing app
  console.log('Done');
  await browser.close();
};

App();