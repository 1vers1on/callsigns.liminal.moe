<script lang="ts">
    import { page } from '$app/state';
    import { locales, localizeHref } from '$lib/paraglide/runtime';
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { onMount } from 'svelte';
    import { refreshAccessToken } from '$lib/clientAuth';
    import { getAccessToken, setAccessToken } from '$lib/storage.svelte';
    import type { PageProps } from './$types';

    let { children, data } = $props();

    function getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    onMount(async () => {
        const accessToken = getCookie('accessToken');
        if (accessToken) {
            setAccessToken(accessToken);
        }
        if (!getAccessToken()) {
            console.log('No access token found, refreshing...');
            if (data?.refreshToken) {
                await refreshAccessToken();
                document.cookie = `accessToken=${getAccessToken()}; max-age=600; path=/`;
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
