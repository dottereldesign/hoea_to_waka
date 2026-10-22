import QRCode from 'qrcode';
import {writeFile} from 'node:fs/promises';
const url='https://dottereldesign.github.io/hoea_to_waka/about/brand-guidelines';
// A full four-module quiet zone and dark modules on white are kept inside the artwork.
const svg=await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'M',margin:4,color:{dark:'#202329',light:'#ffffff'}});
await writeFile('assets/brand-guide-qr.svg',svg);
await QRCode.toFile('assets/brand-guide-qr.png',url,{type:'png',width:720,errorCorrectionLevel:'M',margin:4,color:{dark:'#202329',light:'#ffffff'}});
console.log('Brand guide QR:',url);
