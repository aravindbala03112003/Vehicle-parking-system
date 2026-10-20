const https = require('https');

function check() {
  https.get('https://park-my-spot.vercel.app', res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('Live HTTP Status:', res.statusCode);
      console.log('Includes updated hero headline:', body.includes('Find, Reserve & Park'));
      console.log('Dead 404 script present in live:', body.includes('jquery-1.11.1.min.js'));
      console.log('Has preload none in live:', body.includes('preload="none"'));
    });
  }).on('error', console.error);
}

check();
