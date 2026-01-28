<script lang="ts">
    import ToolShell from '$lib/components/ToolShell.svelte';
    import * as m from '$lib/paraglide/messages.js';
    import { page } from '$app/state';

    let freqInput = $state('');

    let bands = $derived([
        // --- Long Wave ---
        { name: m.band_2200m(), min: 0.1357, max: 0.1378 },
        { name: m.band_630m(), min: 0.472, max: 0.479 },

        // --- HF / Shortwave ---
        { name: m.band_160m(), min: 1.8, max: 2.0 },
        { name: m.band_80m(), min: 3.5, max: 4.0 },
        { name: m.band_60m(), min: 5.33, max: 5.41 },
        { name: m.band_40m(), min: 7.0, max: 7.3 },
        { name: m.band_30m(), min: 10.1, max: 10.15 },
        { name: m.band_20m(), min: 14.0, max: 14.35 },
        { name: m.band_17m(), min: 18.068, max: 18.168 },
        { name: m.band_15m(), min: 21.0, max: 21.45 },
        { name: m.band_12m(), min: 24.89, max: 24.99 },
        { name: m.band_10m(), min: 28.0, max: 29.7 },

        // --- VHF ---
        { name: m.band_6m(), min: 50, max: 54 },
        { name: m.band_2m(), min: 144, max: 148 },
        { name: m.band_1_25m(), min: 222, max: 225 },

        // --- UHF ---
        { name: m.band_70cm(), min: 420, max: 450 },
        { name: m.band_33cm(), min: 902, max: 928 },
        { name: m.band_23cm(), min: 1240, max: 1300 },
    ]);

    $effect(() => {
        const f = page.url.searchParams.get('freq');
        if (f) {
            freqInput = f;
        }
    });

    let result = $derived.by(() => {
        if (!freqInput) return null;
        
        const f = parseFloat(freqInput);
        if (isNaN(f)) return null;

        const match = bands.find(b => f >= b.min && f <= b.max);

        const wavelength = (300 / f).toFixed(2);

        if (match) {
            return {
                status: 'match',
                bandName: match.name,
                wavelength: wavelength,
                range: m.result_limits({ min: match.min, max: match.max })
            };
        } else {
            return {
                status: 'no_match',
                bandName: m.status_out_of_band(),
                wavelength: wavelength,
                range: m.status_no_range()
            };
        }
    });
</script>

<ToolShell>
    <header class="mb-10 text-center">
        <div
            class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg"
        >
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <h1 class="text-4xl font-black tracking-tight text-slate-900">
            {m.band_checker_title()}
        </h1>
        <p class="mt-2 text-lg font-medium text-slate-500">
            {m.band_checker_desc()}
        </p>
    </header>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div class="space-y-6">
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <label
                    for="freq"
                    class="mb-4 block text-xs font-bold tracking-widest text-slate-400 uppercase"
                >
                    {m.input_label()}
                </label>
                <div class="relative">
                    <input
                        id="freq"
                        bind:value={freqInput}
                        placeholder="14.074"
                        type="number"
                        step="any"
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xl font-bold text-blue-600 uppercase transition-all outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <span class="text-slate-400 font-bold">{m.input_unit()}</span>
                    </div>
                </div>
            </div>
            
            <p class="text-sm text-slate-400 text-center px-4">
                {m.input_help()} <br>{m.input_example()}
            </p>
        </div>

        <div class="flex flex-col justify-center">
            {#if result}
                <div
                    class="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl ring-1 ring-white/10"
                >
                    <div class="mb-8">
                        <p
                            class="mb-1 text-sm font-bold tracking-widest text-slate-400 uppercase"
                        >
                            {m.result_band_label()}
                        </p>
                        <div class="flex items-baseline gap-2">
                            <span class="{result.status === 'match' ? 'text-blue-400' : 'text-red-400'} text-5xl font-black tracking-tighter"
                                >{result.bandName}</span
                            >
                        </div>
                        {#if result.status === 'match'}
                            <p class="text-lg font-medium text-slate-400 mt-2">
                                {result.range}
                            </p>
                        {/if}
                    </div>

                    <div class="grid grid-cols-1 gap-4 border-t border-white/10 pt-8">
                        <div>
                            <p
                                class="mb-1 text-xs font-bold tracking-widest text-slate-500 uppercase"
                            >
                                {m.result_wavelength_label()}
                            </p>
                            <div class="flex items-baseline gap-2">
                                <p class="text-2xl font-bold">{result.wavelength}</p>
                                <span class="text-sm text-slate-500">{m.result_unit_meters()}</span>
                            </div>
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
                    <p class="font-bold text-slate-400">
                        {m.input_placeholder()}
                    </p>
                </div>
            {/if}
        </div>
    </div>
</ToolShell>
