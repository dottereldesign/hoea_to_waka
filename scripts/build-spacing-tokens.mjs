import fs from 'node:fs';import * as css from 'css-tree';
const {tokens}=JSON.parse(fs.readFileSync('design/spacing-tokens.json','utf8'));
for(const token of tokens){if(!/^space-[a-z0-9-]+$/.test(token.name))throw Error('Invalid spacing token');css.parse(token.value,{context:'value'});}
fs.writeFileSync('assets/spacing-tokens.css',':root{\n'+tokens.map(t=>`  --${t.name}:${t.value};`).join('\n')+'\n}\n');
