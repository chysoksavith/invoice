<script setup lang="ts">
const config = useRuntimeConfig()
const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="space-y-6">
    <!-- Hero Section -->
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-6 sm:p-8">
        <div class="flex flex-wrap items-center gap-2 mb-2">
          <span class="badge badge-primary font-semibold">Nuxt 4</span>
          <span class="badge badge-secondary font-semibold">NestJS + PostgreSQL</span>
          <span class="badge badge-accent font-semibold">daisyUI v5</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-base-content">
          Nuxt + NestJS Client
        </h1>
        <p class="text-base-content/70 max-w-2xl text-base sm:text-lg">
          Frontend client ready to communicate with your NestJS API and PostgreSQL database (`mlv8`).
        </p>
        <div class="card-actions mt-4 flex flex-wrap gap-3">
          <NuxtLink v-if="!isAuthenticated" to="/login">
            <UiAppButton variant="primary">Go to Login / Register</UiAppButton>
          </NuxtLink>
          <NuxtLink v-else to="/dashboard">
            <UiAppButton variant="primary">Go to Dashboard</UiAppButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- API Config Card -->
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <h2 class="card-title text-lg font-semibold">API Configuration</h2>
        <div class="text-sm text-base-content/70 space-y-1">
          <p>
            Configured API Base URL:
            <code class="badge badge-neutral font-mono text-xs px-2 py-1 ml-1">{{ config.public.apiBase }}</code>
          </p>
          <p class="text-xs opacity-60">
            Targeting NestJS backend on <code class="font-mono bg-base-200 px-1 py-0.5 rounded">http://localhost:3000/api</code>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
