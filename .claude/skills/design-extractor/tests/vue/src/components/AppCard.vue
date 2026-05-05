<template>
  <div class="card">
    <h3 class="card__title">{{ title }}</h3>
    <div class="card__body"><slot /></div>
  </div>
</template>

<script setup>
defineProps({ title: String });
</script>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}
.card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}
.card__body {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
