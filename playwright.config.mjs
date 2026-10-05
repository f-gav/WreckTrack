import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',
  timeout:30_000,
  fullyParallel:false,
  workers:1,
  reporter:'line',
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure',
    serviceWorkers:'block'
  },
  webServer:{
    command:'node scripts/serve-dist.mjs',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:!process.env.CI
  },
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-iphone',use:{...devices['iPhone 13']}},
    {name:'mobile-android',use:{...devices['Pixel 7']}}
  ]
});
