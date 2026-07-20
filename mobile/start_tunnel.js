const ngrok = require('@expo/ngrok');

(async function() {
  try {
    const url = await ngrok.connect(4000);
    console.log(`\n\n=================================================`);
    console.log(`YOUR TUNNEL URL IS:`);
    console.log(url);
    console.log(`=================================================\n\n`);
  } catch (e) {
    console.error(e);
  }
})();
