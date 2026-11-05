<template>
  <div class="min-h-screen flex flex-col bg-base-200/50 text-base-content">
    <CommonAppHeader />
    <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <slot />
    </main>
    <CommonAppFooter />
  </div>
</template>
