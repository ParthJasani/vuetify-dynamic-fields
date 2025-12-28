import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
// Use the built ESM bundle from the workspace `dist/` to avoid importing .vue from outside the example root
import DynamicFieldsPlugin from '../../dist/vue-dynamic-fields-generator.es.js'

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
