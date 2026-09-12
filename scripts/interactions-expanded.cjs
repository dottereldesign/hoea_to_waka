const {chromium}=require('playwright');const assert=require('node:assert/strict');const serve=require('./preview.cjs');
(async()=>{const server=serve(8771),browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/contact.js',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:(await r.text()).replace('window.location.href =','window.__preparedMailto =')});});
  await p.goto('http://127.0.0.1:8771/hoea_to_waka/contact/');await p.waitForFunction(()=>window.HoeaDesignStudio?.version===2);
  await p.getByLabel('Name',{exact:true}).fill('Local UI test');await p.getByLabel('Email',{exact:true}).fill('test@example.com');await p.getByLabel('How can Anna help?').fill('Keep this message through every design.');
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(100);
  await p.getByRole('button',{name:'Change Page header design',exact:true}).click();
  const dialog=p.locator('dialog');assert.equal(await dialog.locator('.ds-choice').count(),51);
  await dialog.getByRole('searchbox',{name:'Search designs'}).fill('threshold');assert.equal(await dialog.locator('.ds-choice').count(),1);
  await dialog.getByRole('button',{name:'Favourite Threshold',exact:true}).click();
  await dialog.locator('.ds-choice').click();assert.equal(await p.locator('.ds-type-header').getAttribute('data-design'),'50');
  await dialog.getByRole('searchbox',{name:'Search designs'}).fill('');await dialog.getByRole('button',{name:'Favourites',exact:true}).click();assert.equal(await dialog.locator('.ds-choice').count(),1);
  await p.screenshot({path:'tmp/design-studio/expanded/picker-mobile.png'});
  await p.keyboard.press('Escape');await p.reload();await p.waitForFunction(()=>window.HoeaDesignStudio?.version===2);assert.equal(await p.locator('.ds-type-header').getAttribute('data-design'),'50');
  // Whole-page library shares search and favourites.
  await p.getByRole('button',{name:'Open design studio',exact:true}).click();await dialog.getByRole('searchbox').fill('observatory');await dialog.locator('.ds-choice').click();
  assert((await p.evaluate(()=>window.HoeaDesignStudio.components.map(c=>c.value))).every(v=>v===37));
  await p.getByLabel('Name',{exact:true}).fill('Keep me');await p.getByLabel('Email',{exact:true}).fill('test@example.com');await p.getByLabel('How can Anna help?').fill('Keep this message through every design.');
  for(let v=0;v<=50;v++){
    await p.evaluate(v=>window.HoeaDesignStudio.all(v),v);assert.equal(await p.getByLabel('Name',{exact:true}).inputValue(),'Keep me');
  }
  await p.locator('[data-contact-form]').scrollIntoViewIfNeeded();await p.waitForTimeout(100);
  await p.getByRole('button',{name:'Change form design',exact:true}).click();assert.equal(await dialog.locator('.ds-choice').count(),51);
  await dialog.getByRole('searchbox').fill('Afterglow');await dialog.locator('.ds-choice').click();
  assert.equal(await p.locator('[data-contact-form]').getAttribute('data-atom-extended'),'afterglow');
  await p.keyboard.press('Escape');await p.evaluate(()=>window.HoeaDesignStudio.all(0));
  assert.equal(await p.locator('[data-contact-form]').getAttribute('data-atom-extended'),null);
  assert.equal(await p.getByLabel('Name',{exact:true}).inputValue(),'Keep me');
  await p.evaluate(()=>window.HoeaDesignStudio.all(50));
  await p.getByRole('button',{name:'Prepare email',exact:true}).click();assert.match(await p.evaluate(()=>window.__preparedMailto),/^mailto:anna@hoeatowaka/);
  await p.getByRole('button',{name:'Open quick contact',exact:true}).click();assert(await p.locator('.ds-quick-panel').isVisible());await p.keyboard.press('Escape');assert.equal(await p.locator('.ds-quick-panel').isVisible(),false);
  await p.getByRole('button',{name:'Open design studio',exact:true}).click();await dialog.getByRole('button',{name:'Reset originals',exact:true}).click();assert.equal(await p.locator('.ds-expanded').count(),0);
  await p.goto('http://127.0.0.1:8771/hoea_to_waka/?design=50');await p.waitForFunction(()=>window.HoeaDesignStudio?.version===2);assert.equal(await p.locator('.ds-type-hero').getAttribute('data-design'),'50');
  await p.emulateMedia({reducedMotion:'no-preference'});
  for(let v=6;v<=50;v++){await p.evaluate(v=>window.HoeaDesignStudio.all(v),v);await p.waitForTimeout(25);}
  await p.waitForTimeout(1600);assert.equal(await p.locator('.ds-type-hero .ds-title').evaluate(e=>getComputedStyle(e).opacity),'1');
  await p.setViewportSize({width:1440,height:1000});await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>window.HoeaDesignStudio.all(6));await p.getByRole('button',{name:'Change Homepage hero design',exact:true}).click();await p.screenshot({path:'tmp/design-studio/expanded/picker-desktop.png'});
  assert.deepEqual(errors,[]);console.log('PASS: 51 choices, search, favourites, persistence, full-page apply, all 51 form states, intercepted mailto, quick contact, Original reset, design=50, all 45 motion-enabled mounts.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
