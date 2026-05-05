<template>
  <main class="home">
    <nav class="nav">
      <span class="nav__logo">FixtureApp</span>
      <div class="nav__actions">
        <AppButton variant="ghost">Dashboard</AppButton>
        <AppButton variant="primary">Get Started</AppButton>
      </div>
    </nav>

    <section class="hero">
      <h1 class="hero__title">Vue Fixture</h1>
      <p class="hero__subtitle">Design system test fixture for the design-extractor skill.</p>
      <div class="hero__cta">
        <AppButton variant="primary">Primary Action</AppButton>
        <AppButton variant="secondary">Secondary</AppButton>
      </div>
    </section>

    <section class="components">
      <AppCard title="Card Title">Card body text with default styling.</AppCard>
      <AppCard title="Another Card">Secondary content example.</AppCard>
    </section>
  </main>
</template>

<script setup>
import AppButton from '../components/AppButton.vue';
import AppCard from '../components/AppCard.vue';
</script>

<style scoped>
@import '../assets/variables.css';

.home { min-height: 100vh; background: var(--color-background); }
.nav { display: flex; align-items: center; padding: 0 var(--spacing-8); height: 64px; border-bottom: 1px solid var(--color-border); }
.nav__logo { font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.nav__actions { margin-left: auto; display: flex; gap: var(--spacing-3); }
.hero { padding: var(--spacing-16) var(--spacing-8); background: var(--color-surface); text-align: center; }
.hero__title { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.hero__subtitle { margin-top: var(--spacing-4); font-size: var(--font-size-base); color: var(--color-text-secondary); }
.hero__cta { display: flex; gap: var(--spacing-3); justify-content: center; margin-top: var(--spacing-6); }
.components { display: flex; gap: var(--spacing-4); padding: var(--spacing-16) var(--spacing-8); }
</style>
