<template>
  <button :class="['btn', `btn--${variant}`]" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
});
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-sans);
  cursor: pointer;
  transition: background 0.15s;
}
.btn--primary { background: var(--color-primary); color: #fff; border: none; }
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--secondary { background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); }
.btn--ghost { background: transparent; border: none; color: var(--color-text-secondary); }
</style>
