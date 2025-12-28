import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'VueDynamicFieldsGenerator',
      fileName: (format) => `vue-dynamic-fields-generator.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Don't bundle peer deps
      external: ['vue', 'vuetify', '@vuelidate/core', '@vuelidate/validators'],
      output: {
        globals: {
          vue: 'Vue',
          vuetify: 'Vuetify',
          '@vuelidate/core': 'vuelidate',
          '@vuelidate/validators': 'vuelidateValidators'
        }
      }
    }
  }
})
