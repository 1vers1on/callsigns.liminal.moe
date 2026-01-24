<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
    import { onMount } from 'svelte';
    import * as m from '$lib/paraglide/messages.js';

    let currentLanguage = $state('en');

    let apiKeys = $state<any[]>([]);
    let newKeyLabel = $state('');
    let newlyCreatedSecret = $state<string | null>(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'ja', name: '日本語' },
        { code: 'ru', name: 'Русский' }
    ];

    onMount(() => {
        const savedLang = localStorage.getItem('app-language');
        if (savedLang) {
            currentLanguage = savedLang;
        }
        apiKeys = [
            {
                id: 1,
                label: 'Development',
                keyPrefix: 'pk_live_4a...',
                createdAt: new Date('2023-10-01')
            }
        ];
    });

    function saveSettings() {
        localStorage.setItem('app-language', currentLanguage);
        window.location.reload();
    }

    async function generateApiKey() {
        if (!newKeyLabel) return;

        const mockSecret =
            'pk_live_' +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const mockPrefix = mockSecret.substring(0, 10) + '...';

        const newKey = {
            id: Date.now(),
            label: newKeyLabel,
            keyPrefix: mockPrefix,
            createdAt: new Date()
        };

        apiKeys = [...apiKeys, newKey];
        newlyCreatedSecret = mockSecret;
        newKeyLabel = '';
    }

    function deleteApiKey(id: number) {
        apiKeys = apiKeys.filter((k) => k.id !== id);
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div class="mb-8">
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
                {m.settings_page_title()}
            </h1>
            <p class="mt-2 text-slate-600">
                {m.settings_page_description()}
            </p>
        </div>

        <div class="space-y-6">
            <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h2 class="text-lg font-semibold text-slate-900">
                        {m.language_section_title()}
                    </h2>
                    <p class="mt-1 text-sm text-slate-600">
                        {m.language_section_description()}
                    </p>
                </div>
                <div class="p-6">
                    <select
                        bind:value={currentLanguage}
                        class="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    >
                        {#each languages as lang}
                            <option value={lang.code}>{lang.name}</option>
                        {/each}
                    </select>
                </div>
            </section>

            <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h2 class="text-lg font-semibold text-slate-900">
                        {m.api_keys_section_title()}
                    </h2>
                    <p class="mt-1 text-sm text-slate-600">
                        {m.api_keys_section_description()}
                    </p>
                </div>

                <div class="space-y-6 p-6">
                    <div class="flex items-end gap-3">
                        <div class="flex-grow">
                            <label
                                for="key-label"
                                class="mb-1 block text-sm font-medium text-slate-700"
                            >
                                {m.key_label_input_label()}
                            </label>
                            <input
                                type="text"
                                id="key-label"
                                bind:value={newKeyLabel}
                                placeholder={m.key_label_placeholder()}
                                class="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            />
                        </div>
                        <button
                            onclick={generateApiKey}
                            disabled={!newKeyLabel}
                            class="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {m.generate_key_button()}
                        </button>
                    </div>

                    {#if newlyCreatedSecret}
                        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div class="flex items-start">
                                <div class="flex-shrink-0">
                                    <svg
                                        class="h-5 w-5 text-amber-600"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fill-rule="evenodd"
                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div class="ml-3 w-full">
                                    <h3 class="text-sm font-medium text-amber-800">
                                        {m.save_key_warning_title()}
                                    </h3>
                                    <div class="mt-2 text-sm text-amber-700">
                                        <p>{m.save_key_warning_text()}</p>
                                    </div>
                                    <div class="mt-3 flex items-center gap-2">
                                        <code
                                            class="block w-full rounded border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-slate-800"
                                        >
                                            {newlyCreatedSecret}
                                        </code>
                                        <button
                                            onclick={() => copyToClipboard(newlyCreatedSecret!)}
                                            class="flex-shrink-0 text-sm font-medium text-amber-800 hover:text-amber-900"
                                        >
                                            {m.copy_button()}
                                        </button>
                                    </div>
                                    <div class="mt-4">
                                        <button
                                            onclick={() => (newlyCreatedSecret = null)}
                                            class="text-sm font-medium text-amber-800 underline hover:text-amber-900"
                                        >
                                            {m.close_save_key_button()}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}

                    {#if apiKeys.length > 0}
                        <div class="overflow-hidden rounded-lg border border-slate-200">
                            <table class="min-w-full divide-y divide-slate-200">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
                                        >
                                            {m.table_header_label()}
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
                                        >
                                            {m.table_header_prefix()}
                                        </th>
                                        <th
                                            scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase"
                                        >
                                            {m.table_header_created()}
                                        </th>
                                        <th scope="col" class="relative px-6 py-3">
                                            <span class="sr-only"
                                                >{m.delete_action_accessible_label()}</span
                                            >
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200 bg-white">
                                    {#each apiKeys as key}
                                        <tr>
                                            <td
                                                class="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900"
                                            >
                                                {key.label || m.untitled_label_fallback()}
                                            </td>
                                            <td
                                                class="px-6 py-4 font-mono text-sm whitespace-nowrap text-slate-500"
                                                >{key.keyPrefix}</td
                                            >
                                            <td
                                                class="px-6 py-4 text-sm whitespace-nowrap text-slate-500"
                                            >
                                                {new Date(key.createdAt).toLocaleDateString(
                                                    languageTag()
                                                )}
                                            </td>
                                            <td
                                                class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap"
                                            >
                                                <button
                                                    onclick={() => deleteApiKey(key.id)}
                                                    class="text-red-600 hover:text-red-900"
                                                >
                                                    {m.revoke_button()}
                                                </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {:else}
                        <div class="py-6 text-center text-sm text-slate-500">
                            {m.no_api_keys_message()}
                        </div>
                    {/if}
                </div>
            </section>

            <div class="flex justify-end pt-4">
                <button
                    onclick={saveSettings}
                    class="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                >
                    {m.save_changes_button()}
                </button>
            </div>
        </div>
    </main>

    <Footer />
</div>
