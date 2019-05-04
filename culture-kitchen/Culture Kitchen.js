// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: utensils;
const formatDate = (time = 0) => (new Date(time)).toISOString().split('T')[0];
const today = formatDate((new Date()).getTime());
const tomorrow = formatDate((new Date()).getTime() + 24*60*60*1000);
const inDays = days => formatDate((new Date()).getTime() + days*24*60*60*1000);

const fn = (date) => {
  let dishes = [];
  ['foodtruck', 'europe', 'asia-india'].forEach(counter => {
    const selector = `[id*='${date}'] [data-category-container='${counter}']`;
    document
      .querySelectorAll(selector)
      .forEach(node => {
        node
          .querySelectorAll('.mt-page-link')
          .forEach(node => {
            const detailId = node.dataset.id.substr(1);
            const detailNode = document.getElementById(detailId);

            const descriptionRaw = detailNode
              .querySelector('.dishDescriptionInner')
              .innerText;

            let match = /(.+)approx\./gm.exec(descriptionRaw);
            if (!match) {
              // Saladbar special rule
              match = /(.+)Roll/.exec(descriptionRaw);
            }
            const description = match[1].trim();

            const price = detailNode
              .querySelector('.dishPriceInner')
              .innerText;

            const energyRaw = detailNode
              .querySelector('.nutrition-values th:first-child + td')
              .innerText;
            match = /(.+)\//gm.exec(energyRaw);
            const energy = `${match[1].trim()} per 100g`;

            dishes.push({ counter, description, energy, price });
          });
      });
  });

  return dishes;
};

const dayOfWeek = new Date().getDay();
const selectedDate = (dayOfWeek == 6 || dayOfWeek == 7) ? inDays(8 - dayOfWeek) : today;

const js = `const fn = ${fn.toString()}; completion(fn("${selectedDate}"));`;
const url = "http://trivago.food-affairs.de/trivago/web-app/";
const browser = new WebView();

await browser.loadURL(url);
const res = await browser.evaluateJavaScript(js, true);

const table = new UITable();
res.forEach(dish => {
  const row = new UITableRow();
  row.addText(dish.description, `${dish.price} | ${dish.energy} | ${dish.counter}`);
  table.addRow(row);
});

table.present();
