import {mkdir,writeFile} from 'node:fs/promises';
import {siClaude,siGooglegemini,siDeepseek,siFigma} from 'simple-icons';
await mkdir('assets/ai-icons',{recursive:true});
for(const [id,icon] of [['claude',siClaude],['gemini',siGooglegemini],['deepseek',siDeepseek],['figma',siFigma]])await writeFile(`assets/ai-icons/${id}.svg`,icon.svg.replace('<svg ',`<svg fill="#${icon.hex}" `));
const response=await fetch('https://raw.githubusercontent.com/simple-icons/simple-icons/15.0.0/icons/openai.svg');
if(!response.ok)throw Error('OpenAI icon fetch failed '+response.status);
const openai=await response.text();if(!openai.startsWith('<svg'))throw Error('Unexpected OpenAI icon');
await writeFile('assets/ai-icons/chatgpt.svg',openai);
await writeFile('assets/ai-icons/NOTICE.txt','Service icons from Simple Icons (CC0-1.0). OpenAI icon: Simple Icons 15.0.0; other icons: installed simple-icons version. Product marks belong to their respective owners. Used only to identify the destinations.\nhttps://github.com/simple-icons/simple-icons\n');
