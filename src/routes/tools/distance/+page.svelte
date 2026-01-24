<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { m } from '$lib/paraglide/messages.js';
    import { gridToLatLng, calculateHaversine } from '$lib/utils/ham';
    import { page } from '$app/state';

    let sourceGrid = $state('');

    $effect(() => {
        const from = page.url.searchParams.get('from');
        if (from) {
            sourceGrid = from;
        }
    });
    let targetGrid = $state('');

    let results = $derived.by(() => {
        if (sourceGrid.length < 4 || targetGrid.length < 4) return null;
        try {
            const [lat1, lon1] = gridToLatLng(sourceGrid);
            const [lat2, lon2] = gridToLatLng(targetGrid);
            return calculateHaversine(lat1, lon1, lat2, lon2);
        } catch (e) {
            return null;
        }
    });
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <nav class="mb-8">
            <a
                href="javascript:history.back()"
                class="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                {m.back_to_profile()}
            </a>
        </nav>

        <header class="mb-10 text-center">
            <div
                class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg"
            >
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                </svg>
            </div>
            <h1 class="text-4xl font-black tracking-tight text-slate-900">
                {m.distance_calculator_title()}
            </h1>
            <p class="mt-2 text-lg font-medium text-slate-500">
                {m.distance_calculator_description()}
            </p>
        </header>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div class="space-y-6">
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label
                        for="source"
                        class="mb-4 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                        >{m.label_source_grid()}</label
                    >
                    <input
                        id="source"
                        bind:value={sourceGrid}
                        placeholder={m.placeholder_grid_example()}
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xl font-bold text-blue-600 uppercase transition-all outline-none focus:ring-2 focus:ring-blue-500"
                        maxlength="6"
                    />
                </div>

                <div class="flex justify-center">
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400"
                    >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            /></svg
                        >
                    </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <label
                        for="target"
                        class="mb-4 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                        >{m.label_target_grid()}</label
                    >
                    <input
                        id="target"
                        bind:value={targetGrid}
                        placeholder={m.placeholder_grid_example()}
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xl font-bold text-slate-800 uppercase transition-all outline-none focus:ring-2 focus:ring-blue-500"
                        maxlength="6"
                    />
                </div>
            </div>

            <div class="flex flex-col justify-center">
                {#if results}
                    <div
                        class="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl ring-1 ring-white/10"
                    >
                        <div class="mb-8">
                            <p
                                class="mb-1 text-sm font-bold tracking-widest text-slate-400 uppercase"
                            >
                                {m.label_path_distance()}
                            </p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-6xl font-black tracking-tighter text-blue-400"
                                    >{Math.round(results.km).toLocaleString()}</span
                                >
                                <span class="text-2xl font-bold text-slate-500"
                                    >{m.unit_kilometers()}</span
                                >
                            </div>
                            <p class="text-lg font-medium text-slate-400">
                                {Math.round(results.miles).toLocaleString()}
                                {m.unit_miles()}
                            </p>
                        </div>

                        <div class="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                            <div>
                                <p
                                    class="mb-1 text-xs font-bold tracking-widest text-slate-500 uppercase"
                                >
                                    {m.label_bearing()}
                                </p>
                                <p class="text-2xl font-bold">{Math.round(results.bearing)}°</p>
                            </div>
                            <div>
                                <p
                                    class="mb-1 text-xs font-bold tracking-widest text-slate-500 uppercase"
                                >
                                    {m.label_path_type()}
                                </p>
                                <p class="text-2xl font-bold">{m.path_great_circle()}</p>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div
                        class="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center"
                    >
                        <div class="mb-4 rounded-full bg-slate-100 p-4">
                            <svg
                                class="h-8 w-8 text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <p class="font-bold text-slate-400">{m.error_invalid_grid()}</p>
                    </div>
                {/if}
            </div>
        </div>
    </main>
</div>
