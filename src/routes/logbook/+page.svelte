<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import { page } from '$app/state';
    import * as m from '$lib/paraglide/messages.js';

    let { data } = $props();
    let searchInput = $state(data.searchQuery);

    function handleSearch() {
        const url = new URL(page.url);
        if (searchInput) {
            url.searchParams.set('q', searchInput);
        } else {
            url.searchParams.delete('q');
        }
        goto(url, { replaceState: true, keepFocus: true, noScroll: true });
    }

    async function handleDelete(id: string) {
        if (!confirm(m.confirm_delete())) return;

        const response = await fetch(`/api/v1/qso`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            await invalidateAll();
        } else {
            alert(m.error_delete_failed());
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString([], { 
            dateStyle: 'short', 
            timeStyle: 'short', 
            timeZone: 'UTC' 
        });
    }
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <h1 class="text-4xl font-black tracking-tight text-slate-900">
                    {m.logbook_title()}
                </h1>
                <p class="mt-2 text-slate-600">
                    {m.logbook_stats({ count: data.qsos.length })}
                </p>
            </div>
            
            <div class="relative w-full max-w-md">
                <input
                    type="text"
                    bind:value={searchInput}
                    oninput={handleSearch}
                    placeholder={m.search_placeholder()}
                    class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <div class="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        </div>

        {#if data.qsos.length === 0}
            <div class="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <p class="text-slate-500 font-medium">{m.no_records_found()}</p>
                <a href="/contact" class="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
                    {m.log_new_qso_link()}
                </a>
            </div>
        {:else}
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th class="px-6 py-4">{m.table_date()}</th>
                                <th class="px-6 py-4">{m.table_callsign()}</th>
                                <th class="px-6 py-4">{m.table_band()}</th>
                                <th class="px-6 py-4">{m.table_mode()}</th>
                                <th class="px-6 py-4 text-right">{m.table_actions()}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            {#each data.qsos as qso}
                                <tr class="transition hover:bg-slate-50/50">
                                    <td class="px-6 py-4 font-mono text-slate-500">{formatDate(qso.timestamp)}</td>
                                    <td class="px-6 py-4">
                                        <span class="font-mono text-lg font-black text-slate-900">{qso.contactCallsign}</span>
                                    </td>
                                    <td class="px-6 py-4">{qso.band}</td>
                                    <td class="px-6 py-4">
                                        <span class="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{qso.mode}</span>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex justify-end gap-3">
                                            <button 
                                                onclick={() => goto(`/contact?editId=${qso.id}`)}
                                                class="font-bold text-slate-400 hover:text-blue-600"
                                            >
                                                {m.btn_edit()}
                                            </button>
                                            <button 
                                                onclick={() => handleDelete(qso.id)}
                                                class="font-bold text-slate-400 hover:text-red-600"
                                            >
                                                {m.btn_delete()}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    </main>
</div>