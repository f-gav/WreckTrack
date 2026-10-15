import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
});

test('full backup round-trip restores a deleted creature and survives reload',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await page.locator('#grid-new-creature').click();
  await page.locator('#creature-name').fill('Архивный страж');
  await page.locator('#creature-abilities').fill('**Восстановленное описание**');
  await page.locator('#creature-form').getByRole('button',{name:'Сохранить'}).click();
  await expect(page.locator('.bestiary-card').filter({hasText:'Архивный страж'})).toBeVisible();

  await page.locator('.topbar-settings-button').click();
  await page.locator('[data-settings-section="data"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#create-full-backup').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^WreckTrack-Data-v\d+-\d{4}-\d\d-\d\d\.json$/);
  const backup=JSON.parse(await (await import('node:fs/promises')).readFile(await download.path(),'utf8'));
  expect(backup.format).toBe('wrecktrack-data');
  expect(backup.archive.bestiary.some(x=>x.name==='Архивный страж')).toBe(true);

  // Simulate a destructive local edit after the backup was created.
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  const card=page.locator('.bestiary-card').filter({hasText:'Архивный страж'});
  page.once('dialog',dialog=>dialog.accept());
  await card.locator('.card-more-menu summary').click();
  await card.locator('[data-delete-creature]').click();
  await expect(card).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('gm-archive-v2'))?.bestiary?.some(x=>x.name==='Архивный страж'))).toBe(false);

  await page.locator('.topbar-settings-button').click();
  await page.locator('[data-settings-section="data"]').click();
  await page.locator('#backup-restore-file').setInputFiles({
    name:download.suggestedFilename(),mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(backup))
  });
  await expect(page.locator('#backup-restore-dialog')).toBeVisible();
  await page.locator('#backup-restore-replace').click();
  await expect(page.locator('#backup-restore-dialog')).not.toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Бестиарий'}).first().click();
  await expect(page.locator('.bestiary-card').filter({hasText:'Архивный страж'})).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('gm-archive-v2'))?.bestiary?.find(x=>x.name==='Архивный страж')?.abilities)).toBe('**Восстановленное описание**');
});
