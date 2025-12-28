# vue-dynamic-fields-generator

A small Vue 3 plugin that exposes a `DynamicFieldsGenerator` component for generating dynamic Vuetify form fields driven by a JSON schema.

Usage

1. Install peer deps in your app (`vue`, `vuetify`, `@vuelidate/core`, `@vuelidate/validators`).
2. Install this package or use it via local path during development.

Register plugin:

```js
import { createApp } from 'vue'
import App from './App.vue'
import DynamicFieldsPlugin from 'vue-dynamic-fields-generator' // or local path
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const app = createApp(App)
app.use(createVuetify())
app.use(DynamicFieldsPlugin)
app.mount('#app')
```

Or import the component directly:

```js
import { DynamicFieldsGenerator } from 'vue-dynamic-fields-generator'
```

Example

See the `example/` folder for a minimal Vite + Vuetify app demonstrating usage.

Build & publish

1. Build the library (produces `dist/`):

```bash
npm run build
```

2. The build outputs ESM and UMD bundles in `dist/`. Peer dependencies (`vue`, `vuetify`, `@vuelidate/*`) are external and must be installed by the consumer.

TypeScript

This package includes basic type declarations at `types/index.d.ts`. Importing `vue-dynamic-fields-generator` in a TypeScript project should pick up the plugin and `DynamicFieldsGenerator` component types.
