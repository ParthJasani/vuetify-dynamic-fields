import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
// Use the published package in the example (import only from npm)
import DynamicFieldsPlugin from 'vuetify-dynamic-fields'

/* let DynamicFieldsPlugin;
try {
	const m = await import('../../dist/vue-dynamic-fields-generator.es.js')
	DynamicFieldsPlugin = m.default || m
} catch (err) {
	// If local bundle is not available, fall back to installed npm package
	const m = await import('vuetify-dynamic-fields')
	DynamicFieldsPlugin = m.default || m
} */

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const vuetify = createVuetify({
	components,
	directives,
})

const app = createApp(App)
app.use(vuetify)
app.use(DynamicFieldsPlugin)
app.mount('#app')
