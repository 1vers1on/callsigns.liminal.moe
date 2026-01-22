<script lang="ts">
    import { m } from '$lib/paraglide/messages.js';
    import { logout, loggedIn } from '$lib/clientAuth';
    import { onMount } from 'svelte';

    let user = false;

    onMount(async () => {
        user = await loggedIn();
        setInterval(async () => {
            user = await loggedIn();
        }, 1 * 1000); // Check every 1 seconds
    });
</script>

<header
    class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6"
>
    <a
        href="/"
        class="flex items-center gap-2 text-lg font-bold text-blue-600 no-underline sm:text-xl"
    >
        {m.site_title()}
    </a>

    <div class="flex items-center gap-2 sm:gap-3">
        {#if user}
            <a
                href="/settings"
                class="rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-slate-500 no-underline transition-colors hover:bg-blue-50 hover:text-blue-600 sm:px-4"
            >
                {m.button_settings()}
            </a>
            <form on:submit|preventDefault={logout}>
                <button
                    type="submit"
                    class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:px-4"
                >
                    {m.button_logout()}
                </button>
            </form>
        {:else}
            <a
                href="/login"
                class="rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-slate-500 no-underline transition-colors hover:bg-blue-50 hover:text-blue-600 sm:px-4"
            >
                {m.button_login()}
            </a>
            <a
                href="/register"
                class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-blue-700 sm:px-4"
            >
                {m.button_register()}
            </a>
        {/if}
    </div>
</header>
