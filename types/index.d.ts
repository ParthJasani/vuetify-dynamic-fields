import { Plugin, Component } from 'vue'

declare const _default: Plugin & {
  install?: Plugin['install']
}

export default _default
export const DynamicFieldsGenerator: Component

declare module 'vue-dynamic-fields-generator' {
  export { DynamicFieldsGenerator }
  export default _default
}
