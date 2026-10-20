const fs = require('fs');

const homeHtml = fs.readFileSync('vehicle-parking/home.html', 'utf8');
const rootHomeHtml = fs.readFileSync('home.html', 'utf8');
const homeCss = fs.readFileSync('vehicle-parking/home.css', 'utf8');
const indexPhp = fs.readFileSync('vehicle-parking/index.php', 'utf8');

console.log('====================================================');
console.log('  VERIFICATION OF CRITICAL USER REPORTED ISSUES');
console.log('====================================================\n');

// 1. Check for 404 scripts
const has404Scripts = homeHtml.includes('js/jquery-1.11.1.min.js') || 
                      rootHomeHtml.includes('js/jquery-1.11.1.min.js') ||
                      indexPhp.includes('js/jquery-1.11.1.min.js');
console.log('1. Dead 404 script tags eliminated:', !has404Scripts ? '✅ PASS' : '❌ FAIL');

// 2. Check for broken letter spacing / strike-through
const hasBrokenUnderline = homeCss.includes('text-underline-offset:-1.4rem') || 
                           homeCss.includes('letter-spacing: 1.7rem') ||
                           homeCss.includes('letter-spacing:1.7rem');
console.log('2. Broken About Us letter-spacing / strike-through eliminated:', !hasBrokenUnderline ? '✅ PASS' : '❌ FAIL');

// 3. Check for absolute navbar overlap
const hasAbsoluteNav = homeCss.includes('position:absolute;\n  top: 10px;\n  right: 40px;');
console.log('3. Hardcoded absolute navbar overlap eliminated:', !hasAbsoluteNav ? '✅ PASS' : '❌ FAIL');

// 4. Check for video blocking
const hasPreloadNone = homeHtml.includes('preload="none"') && homeHtml.includes('poster=');
console.log('4. Video infinite loading fixed with preload="none" & poster:', hasPreloadNone ? '✅ PASS' : '❌ FAIL');

// 5. Check optimized image sizes
const p1 = fs.statSync('vehicle-parking/parking1.jpg').size;
const p2 = fs.statSync('vehicle-parking/parking2.jpg').size;
const p3 = fs.statSync('vehicle-parking/parking3.jpg').size;
const p4 = fs.statSync('vehicle-parking/parking4.jpg').size;
const h4 = fs.statSync('vehicle-parking/project images/home4.jpg').size;

console.log('\n5. Asset sizes optimized:');
console.log('   parking1.jpg:', Math.round(p1/1024), 'KB (was 3,162 KB)');
console.log('   parking2.jpg:', Math.round(p2/1024), 'KB (was 2,608 KB)');
console.log('   parking3.jpg:', Math.round(p3/1024), 'KB (was 1,988 KB)');
console.log('   parking4.jpg:', Math.round(p4/1024), 'KB (was 896 KB)');
console.log('   home4.jpg:   ', Math.round(h4/1024), 'KB (was 256 KB)');

const allUnder100KB = [p1, p2, p3, p4, h4].every(s => s < 100 * 1024);
console.log('   All images under 100KB:', allUnder100KB ? '✅ PASS' : '❌ FAIL');
