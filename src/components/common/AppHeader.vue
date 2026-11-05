<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
</script>

<template>
  <header class="navbar bg-base-100 border-b border-base-200 px-4 md:px-8">
    <div class="flex-1">
      <NuxtLink to="/" class="flex items-center gap-2 text-lg font-bold">
        <span class="badge badge-primary font-semibold">Nuxt + NestJS</span>
        <span class="hidden sm:inline">Client</span>
      </NuxtLink>
    </div>

    <nav class="flex-none flex items-center gap-2 sm:gap-3">
      <NuxtLink to="/" class="btn btn-ghost btn-sm">Home</NuxtLink>

      <template v-if="isAuthenticated">
        <NuxtLink to="/dashboard" class="btn btn-ghost btn-sm">Dashboard</NuxtLink>
        <span class="text-sm opacity-70 hidden sm:inline">{{ user?.name || user?.email || 'User' }}</span>
        <button class="btn btn-outline btn-error btn-sm" @click="logout">Logout</button>
      </template>

      <template v-else>
        <NuxtLink to="/login" class="btn btn-primary btn-sm">Login</NuxtLink>
      </template>
    </nav>
  </header>
</template>
