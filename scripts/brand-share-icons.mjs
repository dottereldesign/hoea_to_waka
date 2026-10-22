import {mkdir,writeFile} from 'node:fs/promises';
import {siWhatsapp} from 'simple-icons';
await mkdir('assets/share-icons',{recursive:true});
await writeFile('assets/share-icons/whatsapp.svg',siWhatsapp.svg.replace('<svg ','<svg fill="#fff" '));
const response=await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/13.0.0/icons/linkedin.svg');if(!response.ok)throw Error('LinkedIn icon unavailable');const svg=await response.text();if(!svg.startsWith('<svg'))throw Error('Unexpected LinkedIn icon');await writeFile('assets/share-icons/linkedin.svg',svg.replace('<svg ','<svg fill="#fff" '));
await writeFile('assets/share-icons/NOTICE.txt','WhatsApp and LinkedIn icons: Simple Icons, CC0-1.0. LinkedIn artwork from Simple Icons 13.0.0. Product marks identify sharing destinations. https://github.com/simple-icons/simple-icons\n');
