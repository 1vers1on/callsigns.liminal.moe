<script lang="ts">
    import { page } from '$app/state';
    import { locales, localizeHref } from '$lib/paraglide/runtime';
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { onMount } from 'svelte';
    import { refreshAccessToken } from '$lib/clientAuth';
    import { getAccessToken } from '$lib/storage.svelte';
    import type { PageProps } from './$types';

    let { children, data } = $props();

    onMount(async () => {
        if (!getAccessToken()) {
            console.log('No access token found, refreshing...');
            if (data?.refreshToken) {
                await refreshAccessToken();
                document.cookie = `accessToken=${getAccessToken()}; max-age=3600; path=/`;
            } else {
                document.cookie = `accessToken=; max-age=0; path=/`;
            }
        }
    });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}
<div style="display:none">
    {#each locales as locale}
        <a href={localizeHref(page.url.pathname, { locale })}>
            {locale}
        </a>
    {/each}
</div>
