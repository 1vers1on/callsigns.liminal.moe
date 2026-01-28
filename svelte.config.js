import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),
    onwarn: (warning, handler) => {
        if (warning.code === "a11y-no-static-element-interactions") return;
        if (warning.code === "a11y_no_noninteractive_element_interactions") return;
        handler(warning);
    },

    kit: { adapter: adapter() }
};

export default config;
