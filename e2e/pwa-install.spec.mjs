import {test,expect} from '@playwright/test';

// Override the default suite policy: this test must run a real Service Worker.
test.use({serviceWorkers:'allow'});

test('PWA installs its complete shell and opens a cached route offline',async ({page,context,baseURL})=>{
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const registration=await navigator.serviceWorker.register('./service-worker.js');
    await navigator.serviceWorker.ready;
    const worker=registration.active;
    if(!worker)throw new Error('Service Worker did not activate');
    const cachesFound=await caches.keys();
    const current=cachesFound.find(name=>name.startsWith('wrecktrack-static-'));
    if(!current)throw new Error('PWA shell cache missing');
    const cache=await caches.open(current);
    const urls=(await cache.keys()).map(request=>request.url);
    return {urls,control:!!navigator.serviceWorker.controller};
  });
  expect(result.urls.some(url=>url.endsWith('/assets/fonts/belarus-regular.ttf'))).toBeTruthy();
  expect(result.urls.some(url=>url.endsWith('/rooms/'))).toBeTruthy();
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBeTruthy();
  await context.setOffline(true);
  await page.goto('/rooms/');
  await expect(page.locator('body')).toContainText('WreckTrack');
  await context.setOffline(false);
});
