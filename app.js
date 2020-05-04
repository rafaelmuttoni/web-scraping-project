const puppeteer = require('puppeteer');

const App = async () => {
  // Launch browser and go to Pão de Açúcar's page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.paodeacucar.com/');

  // Testing with screenshot
  await page.screenshot({path: 'test.png'});

  // Closing app
  console.log('Done');
  await browser.close();
};

App();