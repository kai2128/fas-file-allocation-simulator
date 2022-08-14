import { defineConfig } from 'cypress'

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  baseUrl: 'http://localhost:3333',
  chromeWebSecurity: false,
})
