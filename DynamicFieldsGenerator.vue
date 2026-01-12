<template>
  <v-form ref="formRef" @submit.prevent>
    <v-row>
      <v-col cols="12" v-for="(field, idx) in fields" :key="field.name || idx">
        <!-- Radio group needs explicit v-radio children; v-radio-group doesn't auto-render items the way select/autocomplete do -->
        <template v-if="['radio', 'radio-group'].includes((field.type || '').toLowerCase())">
          <v-radio-group v-model="formState[field.name]" :label="field.label" :row="field.row || false"
            :error-messages="fieldErrors(field.name)" @change="() => touchField(field.name)" v-bind="field.props || {}" inline>
            <v-radio v-for="(opt, i) in (field.options || [])" :key="opt.value ?? opt.id ?? i"
              :label="opt.label ?? opt.name ?? opt" :value="opt.value ?? opt.id ?? opt" v-bind="opt.props || {}" />
          </v-radio-group>
        </template>
        <template v-else>
          <component :is="fieldComponent(field.type)" v-model="formState[field.name]"
            v-bind="{ ...componentProps(field), ...(field.props || {}) }" :error-messages="fieldErrors(field?.name)"
            @update:model-value="onFieldUpdate(field.name, $event)" @blur="touchField(field.name)">
            <template v-if="field.type === 'autocomplete'" #item="{ item, props }">
              <v-list-item v-bind="props">{{ item.label ?? item.name ?? item }}</v-list-item>
            </template>
          </component>
        </template>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, computed, defineProps, defineEmits } from 'vue';
// expose a component name so plugin registration can pick it up
defineOptions({ name: 'DynamicFieldsGenerator' })
import useVuelidate from '@vuelidate/core';
import {
  required,
  minLength,
  maxLength,
  email,
  url as urlRule,
  numeric,
  between,
  helpers
} from '@vuelidate/validators';
/* import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css' */

/* Props (no TS): fields: array of field defs, values: initial values */
const props = defineProps({ fields: { type: Array, default: () => [] }, values: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:values', 'change'])


/* Internal form state built from fields + initial values */
const formState = reactive({});

// Recompute validations whenever props.fields changes. useVuelidate accepts a computed rules object.
const validations = computed(() => {
  const rules = {};
  /*   console.log("props.fields",JSON.parse(JSON.stringify(props.fields))) */
  (JSON.parse(JSON.stringify(props.fields)) || []).forEach((f) => {
    if (f && f?.name) {
      rules[f?.name] = ruleFromField(f)
    }
  })
  return rules
})

// initialize and sync formState when fields or values change
watch(() => props.fields, (newFields) => {
  const names = (newFields || []).map(f => f && f.name).filter(Boolean);
  (newFields || []).forEach((f) => {
    if (!f || !f.name) return
    const name = f.name;
    if (formState[name] === undefined) {
      formState[name] = (props.values && props.values[name] !== undefined) ? props.values[name] : (f.default_value !== undefined ? (f.type == 'number' ? parseFloat(f.default_value) : f.default_value) : (f.type === 'checkbox' ? false : null))
    }
  })
  // remove any keys that are no longer present
  Object.keys(formState).forEach(k => { if (!names.includes(k)) delete formState[k] })
}, { immediate: true })

// keep in sync with incoming values when parent provides values later
watch(() => props.values, (nv) => {
  if (!nv) return
  Object.keys(nv).forEach(k => {
    if (formState[k] !== undefined) formState[k] = nv[k]
  })
}, { deep: true, immediate: true })

// make v$ `any` so we can index with dynamic field names easily
const v$ = useVuelidate(validations, formState)

// Public API: validate, getValues, reset
async function validate() {
  // use whichever shape v$ provides
  try {
    let valid = false
    if (typeof v$.$validate === 'function') {
      valid = await v$.$validate()
    } else if (v$.value && typeof v$.value.$validate === 'function') {
      valid = await v$.value.$validate()
    }

    // Make sure each field is marked touched/dirty so fieldErrors shows messages
    const keys = Object.keys(validations || {})
    keys.forEach((k) => {
      try {
        const s = getValidationState(k)
        if (s && typeof s.$touch === 'function') s.$touch()
      } catch (e) { }
    })

    return valid
  } catch (e) {
    // fallthrough - treat as invalid
  }
  return false
}

function getValues() {
  return { ...formState }
}

function reset(values) {
  Object.keys(formState).forEach(k => {
    if (values && values[k] !== undefined) formState[k] = values[k]
    else formState[k] = null
  })
  try { if (v$.$reset) v$.$reset(); if (v$.value && v$.value.$reset) v$.value.$reset() } catch (e) { }
}

defineExpose({ validate, getValues, reset })

watch(formState, (nv) => {
  emit('update:values', { ...nv })
  emit('change', { ...nv })
}, { deep: true })

/* Helper: mapping field.type -> component name */
function fieldComponent(type) {
  switch ((type || '').toLowerCase()) {
    case 'string':
    case 'text':
    case 'email':
    case 'url':
      return 'v-text-field'
    case 'number':
      return 'v-number-input'
    case 'file-input':
      return 'v-file-input';
    case 'datepicker':
      return 'v-date-input';
    case 'select':
    case 'dropdown':
      return 'v-select'
    case 'autocomplete':
      return 'v-autocomplete'
    case 'combobox':
      return 'v-combobox'
    case 'checkbox':
    case 'bool':
    case 'boolean':
      return 'v-checkbox'
    case 'radio':
    case 'radio-group':
      return 'v-radio-group'
    case 'textarea':
      return 'v-textarea'
    default:
      return 'v-text-field'
  }
}

function componentProps(field) {
  // deep merge defaults with field.props (so nested objects like menuProps merge)
  const defaults = {
    label: field.label,
    placeholder: field.placeholder,
    required: !!field.required,
    density: field.density || 'comfortable',
    variant: field.variant || 'outlined'
  }

  const t = (field.type || '').toLowerCase()
  if (['select', 'dropdown', 'autocomplete', 'combobox'].includes(t)) {
    defaults.items = field.options || []
    defaults.multiple = !!field.multiple
    defaults.itemTitle = field.itemTitle || 'name'
    defaults.itemValue = field.itemValue || 'id'
  }

  if (['number', 'integer', 'float'].includes(t)) {
    defaults.type = 'number'
    if (field.min !== undefined) defaults.min = field.min
    if (field.max !== undefined) defaults.max = field.max
  }

  if (t === 'radio' || t === 'radio-group') {
    defaults.row = field.row || false;
    defaults.options = field.options || []
  }
  
  if (t === 'datepicker') {
    defaults['prepend-icon'] = "";
    defaults['prepend-inner-icon'] = "$calendar";
  }

  const p = deepMerge({}, defaults, field.props || {})
  return p
}

// simple recursive deep merge for plain objects
function deepMerge(target, ...sources) {
  for (const src of sources) {
    if (!src) continue
    for (const key of Object.keys(src)) {
      const val = src[key]
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) target[key] = {}
        deepMerge(target[key], val)
      } else {
        target[key] = val
      }
    }
  }
  return target
}

function onFieldUpdate(name, value) {
  formState[name] = value
}

function getValidationState(name) {
  if (!v$) return null
  if (v$.value && v$.value[name]) return v$.value[name]
  if (v$[name]) return v$[name]
  return null
}

function touchField(name) {
  const s = getValidationState(name)
  if (s && typeof s.$touch === 'function') s.$touch()
}

function fieldErrors(key) {
  const state = getValidationState(key);
  if (!state) return []
  if (!state.$dirty && !state.$invalid){
     return []
  }
  const errs = (state.$errors || []).map((e) => e.$message || fallbackMsg(e))
  return errs
}

function fallbackMsg(e) {
  switch (e.$validator) {
    case 'required': return 'This field is required'
    case 'minLength': return `Minimum ${e.$params.min} characters`
    case 'maxLength': return `Maximum ${e.$params.max} characters`
    case 'email': return 'Enter a valid email'
    case 'url': return 'Enter a valid URL'
    case 'numeric': return 'Must be a number'
    case 'between': return `Value must be between ${e.$params.min} and ${e.$params.max}`
    case 'min': return `Minimum value is ${e.$params.min}`
    case 'max': return `Maximum value is ${e.$params.max}`
    default: return 'Invalid field'
  }
}

/* Build validations from field definition */
function ruleFromField(field) {
  const rules = {}
  // required
  if (field.required) {
    const msg = field.messages && field.messages.required
    rules.required = msg ? helpers.withMessage(msg, required) : required
  }

  // string length
  if (field.minLength) {
    const n = field.minLength
    const msg = field.messages && field.messages.minLength
    rules.minLength = msg ? helpers.withMessage(msg, minLength(n)) : minLength(n)
  }
  if (field.maxLength) {
    const n = field.maxLength
    const msg = field.messages && field.messages.maxLength
    rules.maxLength = msg ? helpers.withMessage(msg, maxLength(n)) : maxLength(n)
  }

  // common types
  if (field.type === 'email') {
    const msg = field.messages && field.messages.email
    rules.email = msg ? helpers.withMessage(msg, email) : email
  }
  if (field.type === 'url') {
    const msg = field.messages && field.messages.url
    rules.url = msg ? helpers.withMessage(msg, urlRule) : urlRule
  }

  // numeric / range
  if (field.type === 'number') {
    const numMsg = field.messages && field.messages.numeric
    rules.numeric = numMsg ? helpers.withMessage(numMsg, numeric) : numeric
    if (field.min !== undefined && field.max !== undefined) {
      const btMsg = field.messages && field.messages.between
      const bt = between(field.min, field.max)
      rules.between = btMsg ? helpers.withMessage(btMsg, bt) : bt
    } else {
      if (field.min !== undefined) {
        const min = field.min
        const msg = field.messages && (field.messages.min || field.messages.minValue)
        rules.min = msg ? helpers.withMessage(msg, v => {
          if (v === null || v === undefined || v === '') return !field.required
          const n = Number(v); return !Number.isNaN(n) && n >= min
        }) : helpers.withMessage(`Minimum value is ${min}`, v => {
          if (v === null || v === undefined || v === '') return !field.required
          const n = Number(v); return !Number.isNaN(n) && n >= min
        })
      }
      if (field.max !== undefined) {
        const max = field.max
        const msg = field.messages && (field.messages.max || field.messages.maxValue)
        rules.max = msg ? helpers.withMessage(msg, v => {
          if (v === null || v === undefined || v === '') return !field.required
          const n = Number(v); return !Number.isNaN(n) && n <= max
        }) : helpers.withMessage(`Maximum value is ${max}`, v => {
          if (v === null || v === undefined || v === '') return !field.required
          const n = Number(v); return !Number.isNaN(n) && n <= max
        })
      }
    }
  }
  if (field.pattern) {
    const re = new RegExp(field.pattern)
    const msg = field.messages && field.messages.pattern
    rules.pattern = msg ? helpers.withMessage(msg, v => {
      if (!v && !field.required) return true
      return re.test(String(v))
    }) : helpers.withMessage('Invalid format', v => {
      if (!v && !field.required) return true
      return re.test(String(v))
    })
  }
  if (typeof field.custom === 'function') {
    const customFn = field.custom
    const msg = field.messages && (field.messages.custom || field.customMessage)
    rules.custom = helpers.withMessage(msg || 'Invalid', v => {
      try { const ok = customFn(v, field); return ok === true || !!ok } catch { return false }
    })
  }
  return rules
}

</script>

<style scoped>
/* small helpers */
</style>
