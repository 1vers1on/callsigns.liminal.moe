<script lang="ts">
    import { page } from '$app/stores';
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
    import { m } from '$lib/paraglide/messages.js';

    let status = $derived($page.status);
    let message = $derived($page.error?.message);
</script>

<div class="flex min-h-screen flex-col bg-slate-50">
    <Header />

    <main class="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div class="mb-6 rounded-2xl bg-slate-200 p-6 text-slate-500">
            {#if status === 404}
                <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
            {:else}
                <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            {/if}
        </div>

        <p class="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            {m.error_code_label()}: {status}
        </p>

        <h1 class="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {#if status === 404}
                {m.error_title_404()}
            {:else}
                {m.error_title_generic()}
            {/if}
        </h1>

        <p class="mb-8 max-w-md text-lg text-slate-600">
            {#if status === 404}
                {m.error_desc_404()}
            {:else if message}
                {message}
            {:else}
                {m.error_desc_generic()}
            {/if}
        </p>

        <a
            href="/"
            class="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
            {m.error_home_button()}
        </a>
    </main>

    <Footer />
</div>
