<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { validateHamCallsign } from '$lib/callsignValidation';
    import { goto } from '$app/navigation';

    let { data } = $props();

    let solarData = $derived(data.solar);

    let callsign = $state('');
    let isValid = $derived(callsign ? validateHamCallsign(callsign) : null);

    let recentSearches = ['W1AW', 'KR4IYD', 'N0CALL', 'KR4FNZ'];

    function getConditionColor(status: string) {
        const s = status.toLowerCase();
        if (s.includes('good')) return 'bg-green-500 text-white';
        if (s.includes('fair')) return 'bg-yellow-500 text-yellow-900';
        if (s.includes('poor')) return 'bg-red-500 text-white';
        return 'bg-slate-700 text-slate-300';
    }

    function lookupCallsign(target = callsign) {
        const targetCall = target.toUpperCase();
        if (validateHamCallsign(targetCall)) {
            goto(`/callsign/${targetCall}`);
        }
    }
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <section class="mx-auto mb-6 max-w-2xl text-center">
            <h1 class="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Find Amateur Radio Operators
            </h1>
            <p class="mb-8 text-lg text-slate-600">
                Instant access to license details, DMR IDs, and location data.
            </p>

            <div class="relative mx-auto max-w-lg">
                <div class="relative flex items-center overflow-hidden rounded-xl border-2 bg-white shadow-lg transition-all duration-200
                    {isValid === true ? 'border-green-500 ring-4 ring-green-500/10' : isValid === false ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10'}">
                    <input
                        type="text"
                        class="w-full border-none bg-transparent px-5 py-4 text-xl font-bold tracking-wider text-slate-800 uppercase placeholder-slate-300 ring-0 outline-none"
                        placeholder="W1AW"
                        maxlength="10"
                        bind:value={callsign}
                        onkeydown={(e) => e.key === 'Enter' && lookupCallsign()}
                        autocomplete="off"
                    />
                    <button
                        onclick={() => lookupCallsign()}
                        disabled={!isValid}
                        class="mr-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        Search
                    </button>
                </div>
                
                {#if callsign && isValid !== null}
                    <div class="absolute right-0 -bottom-8 left-0 flex justify-center">
                        {#if isValid}
                            <div class="flex items-center gap-1.5 text-sm font-medium text-green-600">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                                Valid Format
                            </div>
                        {:else}
                            <div class="flex items-center gap-1.5 text-sm font-medium text-red-600">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                Invalid Format
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="mt-10 flex flex-wrap justify-center gap-2">
                <span class="py-1 text-sm font-medium text-slate-400">Trending:</span>
                {#each recentSearches as recent}
                    <button
                        onclick={() => lookupCallsign(recent)}
                        class="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                    >
                        {recent}
                    </button>
                {/each}
            </div>

        </section>

        <hr class="my-12 border-slate-200" />

        <section class="rounded-2xl bg-slate-900 shadow-md overflow-hidden">
            <div class="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Solar Propagation
                    </h2>
                    <p class="text-sm text-slate-400 mt-1">
                        Updated: {solarData.updated}
                    </p>
                </div>
                
                <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall HF</span>
                    <span class="{solarData.sfi > 100 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} rounded px-2.5 py-1 text-xs font-bold border border-white/5">
                        {solarData.sfi > 100 ? 'GOOD' : 'FAIR'}
                    </span>
                </div>
            </div>

            <div class="p-6 grid gap-8 lg:grid-cols-2">
                <div>
                    <h3 class="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Solar Indices</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="rounded-xl bg-slate-800/50 p-4 border border-slate-800">
                            <div class="text-xs text-slate-400 mb-1">Solar Flux (SFI)</div>
                            <div class="flex items-end gap-2">
                                <span class="text-3xl font-bold text-yellow-400">{solarData.sfi}</span>
                                <span class="text-xs text-slate-500 mb-1.5">sfu</span>
                            </div>
                        </div>
                        <div class="rounded-xl bg-slate-800/50 p-4 border border-slate-800">
                            <div class="text-xs text-slate-400 mb-1">Sunspots (SN)</div>
                            <div class="flex items-end gap-2">
                                <span class="text-3xl font-bold text-orange-400">{solarData.sn}</span>
                            </div>
                        </div>
                        <div class="rounded-xl bg-slate-800/50 p-4 border border-slate-800">
                            <div class="text-xs text-slate-400 mb-1">A-Index</div>
                            <div class="flex items-end gap-2">
                                <span class="text-3xl font-bold {solarData.aIndex < 15 ? 'text-green-400' : solarData.aIndex < 30 ? 'text-yellow-400' : 'text-red-400'}">
                                    {solarData.aIndex}
                                </span>
                            </div>
                        </div>
                        <div class="rounded-xl bg-slate-800/50 p-4 border border-slate-800">
                            <div class="text-xs text-slate-400 mb-1">K-Index</div>
                            <div class="flex items-end gap-2">
                                <span class="text-3xl font-bold {solarData.kIndex < 3 ? 'text-green-400' : solarData.kIndex < 5 ? 'text-yellow-400' : 'text-red-400'}">
                                    {solarData.kIndex}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Band Conditions</h3>
                    <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-800/30">
                        <table class="w-full text-left text-sm text-slate-400">
                            <thead class="bg-slate-800 text-xs uppercase text-slate-500">
                                <tr>
                                    <th scope="col" class="px-4 py-3 font-semibold">Band</th>
                                    <th scope="col" class="px-4 py-3 font-semibold">Day</th>
                                    <th scope="col" class="px-4 py-3 font-semibold">Night</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800">
                                {#each solarData.conditions as band}
                                    <tr class="hover:bg-slate-800/50">
                                        <td class="px-4 py-2.5 font-medium text-slate-200">{band.band}</td>
                                        <td class="px-4 py-2.5">
                                            <span class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium {getConditionColor(band.day)}">
                                                {band.day}
                                            </span>
                                        </td>
                                        <td class="px-4 py-2.5">
                                            <span class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium {getConditionColor(band.night)}">
                                                {band.night}
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>