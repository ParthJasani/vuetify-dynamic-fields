# vuetify-dynamic-fields 
[![npm](https://img.shields.io/npm/v/vuetify-dynamic-fields)](https://www.npmjs.com/package/vuetify-dynamic-fields)
[![demo](https://img.shields.io/badge/demo-live-brightgreen)](https://parthjasani.github.io/vuetify-dynamic-fields/)

A small Vue 3 plugin that exposes a `DynamicFieldsGenerator` component for generating dynamic Vuetify form fields driven by a JSON schema.

**Install**

- Peer dependencies: `vue` (>=3), `vuetify` (>=3), `@vuelidate/core`, `@vuelidate/validators`.
- Install from npm:

```bash
npm install vuetify-dynamic-fields
```

**Quick usage**

Register the plugin in your app:

```js
import { createApp } from 'vue'
import App from './App.vue'
import DynamicFieldsPlugin from 'vuetify-dynamic-fields'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const app = createApp(App)
app.use(createVuetify())
app.use(DynamicFieldsPlugin)
app.mount('#app')
```

You can also import the `DynamicFieldsGenerator` component directly from the package if you prefer a per-component import.



**Example app (local development)**

The `example/` folder contains a minimal Vite + Vuetify app used for development and demonstration.

- 🔗 **Homepage / Docs:** https://parthjasani.github.io/vuetify-dynamic-fields/  
- 🔗 **Live demo:** https://parthjasani.github.io/vuetify-dynamic-fields/example.html
- 🧪 **Local dev:** see instructions below

To run the example locally:

```bash
cd example
npm install
npm run dev
# open http://localhost:5173 (Vite may choose a different port if 5173 is busy)
```

If you want to test the built bundle inside the example without publishing, run the library build in the root and point the example import to the built file. The recommended workflow for local testing is:

```bash
# from project root
npm run build
# then in the example you may import the ESM file from the workspace dist/ path
```

**Notes about package name & imports**

- This repository's package published on npm is named `vuetify-dynamic-fields`. Importing `vuetify-dynamic-fields` in your app (or in the `example/` project) is the correct, published package name. If you previously followed docs or examples that reference `vue-dynamic-fields-generator`, change the import to `vuetify-dynamic-fields` or update your dependency accordingly.

**Schema (JSON) reference**

Each field in the schema is an object describing a single form control. Fields are provided as an array to the `DynamicFieldsGenerator` component via the `fields` prop. Common properties:

- `name` (string, required): unique key for the field values.
- `type` (string, required): control type. Common values: `string`, `text`, `email`, `url`, `integer`, `number`, `select`, `autocomplete`, `combobox`, `checkbox`, `radio`, `radio-group`.
- `label` (string): label/title for the control.
- `required` (boolean): whether the field is required.
- `default`: default value for the field.
- `min`, `max` (number): numeric range limits for `integer`/`number` fields.
- `minLength`, `maxLength` (number): length limits for text fields.
- `pattern` (string): regex string validation for text fields.
- `options` (array): for selects, radios, autocomplete; may be array of primitives or objects. If objects, use `itemTitle`/`itemValue` to map fields.
- `itemTitle` (string): property name to use as the display text for option objects (e.g. `name`).
- `itemValue` (string): property name to use as the option value (e.g. `id`).
- `multiple` (boolean): allow multiple values (for selects/combobox).
- `props` (object): props forwarded to the underlying Vuetify component (e.g., `placeholder`, `variant`, `density`, `clearable`, `rows`, `textarea`, `menuProps`, etc.).
- `messages` (object): custom validation messages keyed by validator name (e.g., `required`, `minLength`, `max`, `pattern`, `email`, `between`).
- `custom` (function): optional custom validator function. Receives the field value and should return truthy (valid) or falsy (invalid).
- `customMessage` (string): message shown when `custom` validator fails.

Example field (excerpt from the `example` app):

```js
{
  name: 'site_name',
  type: 'string',
  label: 'Site Name',
  required: true,
  default: 'Affidash',
  minLength: 3,
  maxLength: 100,
  messages: { required: 'Site name is required' },
  props: { placeholder: 'Enter the site name', variant: 'outlined', clearable: true }
}
```

Another example with options:

```js
{
  name: 'theme',
  type: 'select',
  label: 'Theme',
  required: true,
  options: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }],
  itemTitle: 'name',
  itemValue: 'id',
  props: { placeholder: 'Select a theme' }
}
```

**Building & publishing**

Build the library (this produces `dist/`):

```bash
npm run build
```

Peer dependencies are externalized from the bundles; consumers must install `vue`, `vuetify` and `@vuelidate/*`.

**TypeScript**

Basic type declarations are included at `types/index.d.ts`.

---

If anything in this README is unclear or you'd like a specific schema example added, open an issue or submit a PR.
