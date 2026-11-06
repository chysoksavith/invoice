<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button'
  }
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'btn-primary'
    case 'secondary':
      return 'btn-secondary'
    case 'outline':
      return 'btn-outline'
    case 'accent':
      return 'btn-accent'
    case 'ghost':
      return 'btn-ghost'
    default:
      return 'btn-primary'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'btn-xs'
    case 'sm':
      return 'btn-sm'
    case 'lg':
      return 'btn-lg'
    default:
      return ''
  }
})
</script>

<template>
  <button
    :type="type"
    :class="['btn', variantClasses, sizeClasses]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
    <slot />
  </button>
</template>
