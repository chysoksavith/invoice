<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { login, register } = useAuth()

const isRegistering = ref(false)
const form = reactive({
  name: '',
  email: '',
  password: ''
})

const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    if (isRegistering.value) {
      await register({ name: form.name, email: form.email, password: form.password })
      navigateTo('/dashboard')
    } else {
      await login({ email: form.email, password: form.password })
      navigateTo('/dashboard')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Authentication failed. Please verify credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Toggle Tabs -->
    <div class="tabs tabs-box mb-6 grid grid-cols-2">
      <button
        type="button"
        :class="['tab text-sm font-medium', !isRegistering ? 'tab-active' : '']"
        @click="isRegistering = false; errorMessage = ''; successMessage = ''"
      >
        Sign in
      </button>
      <button
        type="button"
        :class="['tab text-sm font-medium', isRegistering ? 'tab-active' : '']"
        @click="isRegistering = true; errorMessage = ''; successMessage = ''"
      >
        Register
      </button>
    </div>

    <div class="mb-4 text-center">
      <h2 class="text-2xl font-bold text-base-content">
        {{ isRegistering ? 'Create your account' : 'Welcome back' }}
      </h2>
      <p class="text-sm opacity-70 mt-1">
        {{ isRegistering ? 'Register a new account' : 'Sign in to access your dashboard' }}
      </p>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" role="alert" class="alert alert-error mb-4 text-sm py-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ errorMessage }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UiAppInput
        v-if="isRegistering"
        id="name"
        label="Full Name"
        type="text"
        v-model="form.name"
        placeholder="John Doe"
        required
      />

      <UiAppInput
        id="email"
        label="Email"
        type="email"
        v-model="form.email"
        placeholder="user@example.com"
        required
      />

      <UiAppInput
        id="password"
        label="Password"
        type="password"
        v-model="form.password"
        placeholder="••••••••"
        required
      />

      <UiAppButton
        type="submit"
        variant="primary"
        class="w-full mt-2"
        :loading="loading"
        :disabled="loading"
      >
        {{ isRegistering ? 'Register' : 'Sign in' }}
      </UiAppButton>
    </form>

    <div class="mt-6 text-center text-sm">
      <NuxtLink to="/" class="link link-hover text-primary">← Back to home</NuxtLink>
    </div>
  </div>
</template>
