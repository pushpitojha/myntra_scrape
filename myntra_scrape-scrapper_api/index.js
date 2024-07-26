const puppeteer = require('puppeteer');
const { processLineByLine, returnNewPage } = require('./utils/utils');
const { sendEmailNotification, sendWhatsappNotification } = require('./utils/notifications');


function checkUsersPriceAtMyntra(userDatas){
	//When using json value for SERVICE_ACCOUNTS in .env

const parallelTabs = 5;

const config = {
	launchOptions: {
		headless: false,
		args: ['--no-sandbox']
	},
	viewport: {width: 1920, height: 1080}
}
	let sites=[];
	for(let data of userDatas){
       sites.push({
		url: data.myntraUrl,
		targetPrice: Number(data.thresholdPrice),
		email:data.email
	})
	}1
	puppeteer.launch(config.launchOptions).then(async browser => {
		  const promises=[], total = sites.length;
		  var logs = [];
		let count=0, dcount=0;
		while(count<total){
			let limit = (total-count<parallelTabs)?(total-count):parallelTabs;
			for(let i = 0; i<limit; i++){
				console.log('Page ID Spawned', i);
	
				promises.push(returnNewPage({ browser, config }, count++)
				.then(async data => {
					const {page, tag: number} = data;
					const {url, targetPrice,email} = sites[number];
	
					await page.goto(url);
					await page.waitFor('.pdp-price strong');
					
					const [price, productName] = await page.evaluate(() => {
						const pr = document.querySelector('.pdp-price').innerHTML;
						console.log("...................."+pr);
						const tempDiv = document.createElement('div');
						tempDiv.innerHTML = pr;
						const priceAsText = tempDiv.querySelector('strong').textContent;
						const newText = priceAsText.replace(/\s+/g, '');
						const price=newText.replace("₹","")
						const name = `${document.querySelector('.pdp-title').innerText} ${document.querySelector('.pdp-name').innerText}`;
						return [Number(price), name];
					});
	
					console.log(productName, price);
					if(price <= targetPrice){
						console.log(`Price for ${url} is ${price} (less than target price ${targetPrice})`);
						console.log('Sending email & whatsapp notifications');
						await sendEmailNotification(url, price, productName,email);
						await sendWhatsappNotification(url, price, productName);
					}
	
					await page.close();
				})
				.catch(err => console.log('Error 100', err)))
			}
			console.log('WAITING FOR',limit, 'PROCESSES TO END');
			await Promise.all(promises)
		  }
		console.log('---Closing Browser---');
		  await browser.close();
	
	});
}
module.exports=checkUsersPriceAtMyntra;