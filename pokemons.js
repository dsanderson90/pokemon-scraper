const puppeteer = require("puppeteer");
const chalk = require("chalk");

var fs = require("fs");
// MY OCD of colorful console.logs for debugging... IT HELPS
const error = chalk.bold.red;
const success = chalk.keyword("green");

const url1 = `http://pokemons-source-example.surge.sh/`;


(async () => {
   
    
  try {
    // open the headless browser
    var browser = await puppeteer.launch({ headless: true });
    // open a new page
    var page = await browser.newPage();
    // enter url in page
    await page.goto(
      url1
    );

    var pokemons = await page.evaluate(() => {
        function IsImageOk(img) {
            // During the onload event, IE correctly identifies any images that
            // weren’t downloaded as not complete. Others should too. Gecko-based
            // browsers act like NS4 in that they report this incorrectly.
            if (!img.complete) {
                return false;
            }
        
            // However, they do have two very useful properties: naturalWidth and
            // naturalHeight. These give the true size of the image. If it failed
            // to load, either of these should be zero.
            if (img.naturalWidth === 0) {
                return false;
            }
        
            // No other way of checking: assume it’s ok.
            return true;
        }
      var imgs = document.querySelectorAll(
        `img`
      );
      var arr = [];
imgs.forEach(img => {
    if(!IsImageOk(img)) {
    arr.push(img.src)
    }
})
      return arr;
    });

    // var quotes3 = await page.evaluate(() => {
    //   var quoteNodes = document.querySelectorAll(`dl`);
    //   var arr = [];
    //   const regex = /“|”/gi;
    //   quoteNodes.forEach((node) => {
    //     arr.push({ quote: node.innerText.replace(regex, "").trim() });
    //   });
    //   return arr;
    // });

    await browser.close();


    // Writing the pokemons inside a json file

    fs.writeFile("noImgPokemonnames.json", JSON.stringify(pokemons), function (err) {
      if (err) throw err;

      console.log(success(`finished!`));
    });
    console.log(success("Browser Closed"));
  } catch (err) {
    // Catch and display errors
    console.log(error(err));
    await browser.close();
    console.log(error(`Browser Closed. Pokemons could not be gathered :( ${err}`));
  }
})();

