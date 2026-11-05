<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, fetchUser, logout } = useAuth()

onMounted(async () => {
  if (!user.value) {
    await fetchUser()
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-base-content">Dashboard</h1>
        <p class="text-base-content/70 mt-1">Connected to NestJS backend with PostgreSQL.</p>
      </div>
      <UiAppButton variant="secondary" size="sm" @click="logout">
        Sign out
      </UiAppButton>
    </div>

    <div class="card bg-base-100 shadow border border-base-200">
      <div class="card-body">
        <h2 class="card-title flex items-center justify-between">
          <span>Current User Profile</span>
          <span class="badge badge-success badge-sm">Logged In</span>
        </h2>

        <div v-if="user" class="mt-4 space-y-3">
          <div class="p-3 bg-base-200/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-sm font-semibold opacity-70">User ID:</span>
            <span class="font-mono text-sm">{{ user.id }}</span>
          </div>

          <div class="p-3 bg-base-200/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-sm font-semibold opacity-70">Name:</span>
            <span class="font-medium text-sm">{{ user.name }}</span>
          </div>

          <div class="p-3 bg-base-200/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-sm font-semibold opacity-70">Email:</span>
            <span class="font-mono text-sm font-medium">{{ user.email }}</span>
          </div>
        </div>

        <div v-else class="py-8 flex flex-col items-center justify-center space-y-3">
          <span class="loading loading-spinner loading-md text-primary"></span>
          <p class="text-sm opacity-70">Loading profile from NestJS API...</p>
        </div>
      </div>
    </div>
  </div>
</template>
