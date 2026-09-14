const {chromium}=require('playwright');const assert=require('assert/strict');const serve=require('./preview.cjs');
(async()=>{const server=serve(8767);const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];try{
  const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
  // Intercept the external protocol at its source. Never launch the host mail app in tests.
  await p.route('**/contact.js',async route=>{const response=await route.fetch();const source=await response.text();assert(source.includes('window.location.href ='));await route.fulfill({response,body:source.replace('window.location.href =','window.__preparedMailto =')});});
  await p.goto('http://127.0.0.1:8767/hoea_to_waka/contact/');await p.waitForFunction(()=>window.HoeaDesignStudio);await p.waitForTimeout(200);
  await p.getByLabel('Name',{exact:true}).fill('Studio verification');await p.getByLabel('Email',{exact:true}).fill('test@example.com');await p.getByLabel('How can Anna help?').fill('Testing that our enquiry stays intact.');
  for(let v=0;v<=5;v++){
    await p.evaluate(v=>window.HoeaDesignStudio.all(v),v);
    assert.equal(await p.getByLabel('Name',{exact:true}).inputValue(),'Studio verification');
    assert.equal(await p.getByLabel('Email',{exact:true}).inputValue(),'test@example.com');
    await p.locator('[data-contact-form]').scrollIntoViewIfNeeded();
    await p.waitForFunction(()=>getComputedStyle(document.querySelector('[data-contact-form]')).opacity==='1');
    assert.equal(await p.locator('[data-contact-form]').evaluate(e=>getComputedStyle(e).opacity),'1');
    if(v){await p.getByRole('button',{name:'Open navigation',exact:true}).click();assert.equal(await p.locator('.ds-type-navbar .ds-nav-links').isVisible(),true);await p.keyboard.press('Escape');assert.equal(await p.locator('.ds-type-navbar .ds-nav-links').isVisible(),false);}
  }
  await p.locator('[data-contact-form]').evaluate(e=>{window.__mailNavigation=false;e.addEventListener('submit',()=>window.__mailNavigation=true,{once:true});});
  await p.getByRole('button',{name:'Prepare email',exact:true}).click();assert(await p.evaluate(()=>window.__mailNavigation));assert.match(await p.evaluate(()=>window.__preparedMailto),/^mailto:anna@hoeatowaka\.co\.nz\?subject=/);assert.match(decodeURIComponent(await p.evaluate(()=>window.__preparedMailto)),/Testing that our enquiry stays intact/);assert.match(await p.locator('[data-form-status]').innerText(),/Opening your email app/);
  // Open a section picker via its actual top-layer button.
  await p.evaluate(()=>window.scrollTo(0,0));
  await p.getByRole('button',{name:'Change Page header design',exact:true}).click();
  assert(await p.locator('.ds-picker').isVisible());
  await p.locator('.ds-earlier summary').click();await p.locator('.ds-choice[data-layout-id="3"]').click();
  assert.equal(await p.locator('.ds-type-header').getAttribute('data-design'),'3');
  await p.keyboard.press('Escape');assert.equal(await p.locator('.ds-picker').isVisible(),false);
  await p.reload();await p.waitForFunction(()=>window.HoeaDesignStudio);assert.equal(await p.locator('.ds-type-header').getAttribute('data-design'),'3');
  await p.locator('[data-quick-toggle]').click();assert(await p.locator('.ds-quick-panel').isVisible());await p.locator('[data-quick-toggle]').click();assert.equal(await p.locator('.ds-quick-panel').isVisible(),false);
  await p.goto('http://127.0.0.1:8767/hoea_to_waka/?design=5');await p.waitForFunction(()=>window.HoeaDesignStudio);await p.getByRole('tab').nth(1).click();assert.equal(await p.getByRole('tabpanel').count(),1);await p.getByRole('tab').nth(1).press('ArrowRight');assert.equal(await p.getByRole('tab').nth(2).getAttribute('aria-selected'),'true');
  await p.locator('[data-carousel]').scrollIntoViewIfNeeded();await p.locator('[data-carousel] [data-next]').click();assert.match(await p.locator('.ds-carousel-status').innerText(),/2 \/ 2/);
  await p.getByRole('button',{name:'Open design studio',exact:true}).click();await p.getByRole('button',{name:'Reset originals',exact:true}).click();assert.equal(await p.locator('.ds-component').count(),0);
  await p.reload();await p.waitForFunction(()=>window.HoeaDesignStudio); // query deliberately forces v5 again
  await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(1200);assert.equal(errors.length,0,errors.join('\n'));
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>window.HoeaDesignStudio.all(1));await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(1000);await p.screenshot({path:'tmp/design-studio/editorial-desktop-final.png'});
  await p.getByRole('button',{name:'Change Homepage hero design',exact:true}).click();await p.waitForTimeout(200);await p.screenshot({path:'tmp/design-studio/picker-final.png'});
  assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: all form variants preserve input; mobile navigation and Escape; email preparation; modal picker; persisted section choice; quick contact; keyboard service tabs; testimonial controls; Original restoration; motion-enabled rendering.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
