<template>
  <main class="dashboard">
    <nav class="nav">
      <span class="nav__logo">FixtureApp</span>
      <AppButton variant="ghost">← Home</AppButton>
    </nav>

    <div class="content">
      <h1 class="content__title">Dashboard</h1>
      <div class="grid">
        <AppCard title="Users">1,240</AppCard>
        <AppCard title="Revenue">$48k</AppCard>
        <AppCard title="Errors">3 active</AppCard>
      </div>
    </div>
  </main>
</template>

<script setup>
import AppButton from '../components/AppButton.vue';
import AppCard from '../components/AppCard.vue';
</script>

<style scoped>
.dashboard { min-height: 100vh; background: var(--color-background); }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 0 var(--spacing-8); height: 64px; border-bottom: 1px solid var(--color-border); }
.nav__logo { font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.content { padding: var(--spacing-12) var(--spacing-8); }
.content__title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin-bottom: var(--spacing-8); }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-6); }
</style>
