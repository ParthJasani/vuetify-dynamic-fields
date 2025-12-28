// Plugin entry for vue-dynamic-fields-generator
import DynamicFieldsGenerator from '../DynamicFieldsGenerator.vue'

const install = (app) => {
  app.component((DynamicFieldsGenerator && DynamicFieldsGenerator.name) || 'DynamicFieldsGenerator', DynamicFieldsGenerator)
}

export default { install }
export { DynamicFieldsGenerator }
