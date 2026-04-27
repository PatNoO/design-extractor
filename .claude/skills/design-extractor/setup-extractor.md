# Setup Design Extractor

Your goal is to perfectly adapt the 'design-extractor' skill to the user's specific local repository.

## Steps to execute:

1. **Audit the Project:** Scan `package.json`, configuration files (like `tailwind.config.js`, `tsconfig.json`), and the `src`/`app` directories to identify:
   - The primary frontend framework (e.g., React, Vue, Svelte, plain DOM).
   - The styling methodology (e.g., Tailwind CSS, CSS Modules, Styled Components).
   - The standard component folder structure (e.g., `src/components/ui`).

2. **Update the Skill:** Open `.claude/skills/design-extractor/SKILL.md`.

3. **Append Local Rules:** Add a new section at the very bottom of `SKILL.md` called "Local Project Formatting". In this section, write explicit instructions telling the design-extractor to strictly generate frontend code that matches the framework, styling, and folder structure you just discovered.

4. **Preserve Core Rules:** DO NOT remove, alter, or break the existing "Figma Script Generation Rules" (Top-Level Await, Async Setters, etc.) that ensure the Figma script runs correctly in the console.

5. **Confirm:** Print a success message to the terminal stating what framework and styling were detected, and confirm that the design-extractor is now calibrated for this repo.
