const chalk = require("chalk");
const puppeteer = require("puppeteer");
const noUrlsMons = require("./noImgPokemon.json");
const autoScroll = require("./helpers").autoScroll;
const titleCase = require("./helpers").titleCase;
const fetch = require("node-fetch");
var fs = require("fs");
// MY OCD of colorful console.logs for debugging... IT HELPS
const error = chalk.bold.red;
const success = chalk.keyword("green");
const url1 = `https://pokemondb.net/pokedex/all`;

(async () => {
  try {
    // open the headless browser
    var browser = await puppeteer.launch({ headless: false });
    // open a new page
    var page = await browser.newPage();
    // enter url in page
    await page.goto(url1, { waitUntil: "networkidle0" });
    await page.setViewport({
      width: 1200,
      height: 800,
    });

    await autoScroll(page);

    var pokemons = await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        selectors.map((img) => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", reject);
          });
        })
      );
      const data = Array.from(document.querySelectorAll("tr"));
      var arr = [];
      data.forEach(async (dat) => {
        let img = dat.querySelector("td > span > img.img-fixed").src;
        console.log(img);
        let name = dat.querySelector(".cell-name > a").innerText;
        let types = Array.from(dat.querySelectorAll(".type-icon")).map(
          (el) => el.innerText.toLowerCase()
        );
        let total = Number(dat.querySelectorAll(".cell-total").innerText);
        let statItems = dat.querySelectorAll("td.cell-num");
        let national_number = statItems[0].innerText;
        let hp = Number(statItems[1].innerText);
        let atk = Number(statItems[2].innerText);
        let defense = Number(statItems[3].innerText);
        let sp_atk = Number(statItems[4].innerText);
        let sp_def = Number(statItems[5].innerText);
        let speed = Number(statItems[6].innerText);
        
        let obj = {
          name: name,
          type: types,
          national_number: national_number,
          sprites: {
            normal: img,
          },
          total: total,
          hp: hp,
          attack: atk,
          defense: defense,
          sp_atk: sp_atk,
          sp_def: sp_def,
          speed: speed,
        };
        arr.push(obj);
      });
      return arr;
    });

    // await browser.close();

    // Writing the pokemons inside a json file

    fs.writeFile("workbishv2.json", JSON.stringify(pokemons), function (
      err
    ) {
      if (err) throw err;

      console.log(success(`finished!`));
    });
    console.log(success("Browser Closed"));
  } catch (err) {
    // Catch and display errors
    console.log(error(err));
    await browser.close();
    console.log(
      error(`Browser Closed. Pokemons could not be gathered :( ${err}`)
    );
  }
})();
