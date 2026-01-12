<template>
  <v-app>
    <v-main>
      <v-container>
        <h2 class="mb-4">Dynamic Vuetify Fields generator with JSON <a href="https://www.npmjs.com/package/vuetify-dynamic-fields" class="text-black">(vuetify-dynamic-fields)</a></h2>
        <DynamicFieldsGenerator :fields="schema" :values="valuesRef" @update:values="updateValues" ref="dyn" />
        <v-btn class="mt-4" @click="submit">Validate & Log</v-btn>
        <v-row class="mt-6" align="start" dense>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Form Schema (JSON)</v-card-title>
              <v-card-text>
                <pre class="json-pre">{{ schemaJson }}</pre>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Form Values (JSON)</v-card-title>
              <v-card-text>
                <pre class="json-pre">{{ valuesJson }}</pre>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
const valuesRef = ref({})
const dyn = ref(null)

function updateValues(v) { valuesRef.value = v }

const schema = [
  // simple text
  {
    name: 'site_name',
    type: 'string',
    label: 'Site Name',
    required: true,
    default: 'Affidash',
    minLength: 3,
    maxLength: 100,
    messages: {
      required: 'Site name is required',
      minLength: 'Site name must be at least 3 characters',
      maxLength: 'Site name cannot exceed 100 characters'
    },
    props: {
      placeholder: 'Enter the site name',
      variant: 'outlined',
      density: 'comfortable',
      clearable: true
    }
  },

  // email
  {
    name: 'admin_email',
    type: 'email',
    label: 'Admin Email',
    required: true,
    messages: { email: 'Please enter a valid email address', required: 'Admin email required' },
    props: { placeholder: 'admin@example.com', density: 'compact' }
  },

  // URL
  {
    name: 'website',
    type: 'url',
    label: 'Website',
    required: false,
    messages: { url: 'Please provide a valid website url' },
    props: { placeholder: 'https://example.com' }
  },

  // integer with range using min/max
  {
    name: 'max_users',
    type: 'integer',
    label: 'Max Users',
    required: true,
    min: 1,
    max: 1000,
    messages: {
      required: 'Please specify max users',
      min: 'At least 1 user required',
      max: 'Cannot exceed 1000 users'
    },
    props: { type: 'number', hideSpinButtons: true }
  },

  // float/number with between
  {
    name: 'discount_rate',
    type: 'number',
    label: 'Discount Rate (%)',
    required: false,
    min: 0,
    max: 100,
    messages: { between: 'Discount must be between 0 and 100' },
    props: { type: 'number', suffix: '%' }
  },

  // pattern field
  {
    name: 'sku',
    type: 'string',
    label: 'SKU',
    required: false,
    pattern: '^[A-Z0-9\\-]+$',
    messages: { pattern: 'SKU must be uppercase letters, numbers or hyphens' },
    props: { placeholder: 'ABC-123' }
  },

  // textarea-like (use text type + props to enable multi-line)
  {
    name: 'description',
    type: 'text',
    label: 'Description',
    required: false,
    minLength: 10,
    messages: { minLength: 'Please write at least 10 characters' },
    props: { textarea: true, rows: 4, placeholder: 'Describe the tenant...' }
  },

  // select (single)
  {
    name: 'theme',
    type: 'select',
    label: 'Theme',
    required: true,
    options: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark' }],
    itemlabel: 'name',
    itemValue: 'id',
    messages: { required: 'Choose a theme' },
    props: {
      variant: 'outlined',
      density: 'compact',
      placeholder: 'Select a theme',
      menuProps: { maxHeight: 300, closeOnContentClick: true }
    }
  },

  // autocomplete (single)
  {
    name: 'country',
    type: 'autocomplete',
    label: 'Country',
    required: true,
    options: [
      { id: 'us', name: 'United States', label: 'United States' },
      { id: 'ca', name: 'Canada', label: 'Canada' }
    ],
    itemlabel: 'name',
    itemValue: 'id',
    messages: { required: 'Please pick a country' },
    props: {
      placeholder: 'Start typing a country',
      menuProps: { maxWidth: 400 },
      clearable: true
    }
  },

  // combobox with multiple (tags)
  {
    name: 'features',
    type: 'combobox',
    label: 'Enabled Features',
    required: false,
    multiple: true,
    options: ['chat', 'reports', 'billing'],
    messages: {},
    props: { chips: true, closableChips: true, placeholder: 'Select features' }
  },

  // checkbox
  {
    name: 'is_active',
    type: 'checkbox',
    label: 'Active',
    default: true,
    required: false,
    props: { density: 'comfortable' },
    messages: {}
  },

  // radio group with per-option props and group-level props
  {
    name: 'plan',
    type: 'radio',
    label: 'Plan',
    required: true,
    options: [
      { id: 'free', name: 'Free', value: 'free', props: { disabled: false } },
      { id: 'pro', name: 'Pro', value: 'pro', props: { class: 'font-weight-medium' } },
      { id: 'enterprise', name: 'Enterprise', value: 'enterprise', props: { disabled: false } }
    ],
    messages: { required: 'Please choose a plan' },
    props: { row: true, density: 'compact' } // applied to v-radio-group
  },

  // radio-group (alternative naming)
  {
    name: 'delivery_option',
    type: 'radio-group',
    label: 'Delivery Option',
    required: true,
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'express', label: 'Express', props: { disabled: false } }
    ],
    messages: { required: 'Select a delivery option' },
    props: { row: false }
  },

  // option-level advanced (option object with label/value/props)
  {
    name: 'advanced_choice',
    type: 'select',
    label: 'Advanced Choice',
    required: false,
    options: [
      { id: 1, name: 'Choice A', value: 1, props: { class: 'choice-a' } },
      { id: 2, name: 'Choice B', value: 2, props: { class: 'choice-b', disabled: true } }
    ],
    props: { menuProps: { maxWidth: 250 } }
  },

  // custom validator example (function is allowed in JS defs)
  {
    name: 'custom_code',
    type: 'string',
    label: 'Custom Code',
    required: true,
    custom: (v /*, field */) => {
      // must start with 'X-' and be 5..10 chars in total
      if (!v) return false
      if (typeof v !== 'string') return false
      if (!v.startsWith('X-')) return false
      return v.length >= 5 && v.length <= 10
    },
    customMessage: 'Code must start with X- and be 5–10 chars long',
    props: { placeholder: 'X-1234' }
  }
]

function submit() {
  if (dyn.value) {
    dyn.value.validate().then(valid => {
      console.log('valid?', valid, 'values', dyn.value.getValues())
    })
  }
}

const schemaJson = computed(() => JSON.stringify(schema, null, 2))
const valuesJson = computed(() => JSON.stringify(valuesRef.value || {}, null, 2))
</script>

<style scoped>
.json-pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
