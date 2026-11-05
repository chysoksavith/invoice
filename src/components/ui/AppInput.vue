<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    id?: string
    type?: string
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    type: 'text',
    disabled: false,
    required: false
  }
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <fieldset class="fieldset w-full">
    <legend v-if="label" class="fieldset-legend font-medium text-sm">
      {{ label }}
      <span v-if="required" class="text-error ml-0.5">*</span>
    </legend>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input w-full', error ? 'input-error' : '']"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="fieldset-label text-error text-xs mt-1">{{ error }}</p>
  </fieldset>
</template>
