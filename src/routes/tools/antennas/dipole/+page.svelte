<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
    import AntennaViewer from '$lib/components/AntennaVisualizer.svelte';
    import type { AntennaDesign, AntennaElement } from '$lib/components/AntennaVisualizer.svelte';
    import * as m from '$lib/paraglide/messages.js';

    let frequency = $state(14.175);
    let velocityFactor = $state(0.95);
    
    const C_LIGHT = 299792458; 

    let totalLengthMeters = $derived((C_LIGHT / (frequency * 1000000)) * 0.5 * velocityFactor);
    let totalLengthFeet = $derived(totalLengthMeters * 3.28084);
    
    let legLengthMeters = $derived(totalLengthMeters / 2);
    let legLengthFeet = $derived(totalLengthFeet / 2);

    let design = $derived.by<AntennaDesign>(() => {
        const halfLen = legLengthMeters;
        const gap = 0.05; 

        const feedElement: AntennaElement = {
            id: 'feed',
            type: 'wire',
            points: [{x: -0.02, y: 0}, {x: 0.02, y: 0}],
            isDriven: true,
            group: m.group_feed(),
            color: 'transparent'
        };

        const leftLeg: AntennaElement = {
            id: 'left',
            type: 'wire',
            points: [{x: -halfLen, y: 0}, {x: -gap, y: 0}],
            label: m.element_left(),
            showDimensions: true,
            group: m.group_radiator()
        };

        const rightLeg: AntennaElement = {
            id: 'right',
            type: 'wire',
            points: [{x: gap, y: 0}, {x: halfLen, y: 0}],
            label: m.element_right(),
            showDimensions: true,
            group: m.group_radiator()
        };

        return {
            name: m.design_name(),
            frequency: frequency,
            feedGap: 10,
            elements: [leftLeg, feedElement, rightLeg]
        };
    });

    const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 3, minimumFractionDigits: 3 });
</script>

<div class="min-h-screen bg-slate-50 pb-20">
    <Header />

    <main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <nav class="mb-8">
            <a href="/" class="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-blue-600">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                {m.back_home()}
            </a>
        </nav>

        <header class="mb-10 text-center">
            <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 class="text-4xl font-black tracking-tight text-slate-900">
                {m.dipole_title()}
            </h1>
            <p class="mt-2 text-lg font-medium text-slate-500">
                {m.dipole_description()}
            </p>
        </header>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            <div class="space-y-6 lg:col-span-4">
                
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    
                    <div>
                        <label for="freq" class="mb-2 block text-xs font-bold tracking-widest text-slate-400 uppercase">
                            {m.input_target_freq()}
                        </label>
                        <div class="relative">
                            <input
                                id="freq"
                                type="number"
                                step="0.001"
                                bind:value={frequency}
                                class="no-spinner w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xl font-bold text-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            />
                            <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <span class="text-slate-400 font-bold text-sm">MHz</span>
                            </div>
                        </div>

                        <div class="mt-3 flex flex-wrap gap-2">
                            {#each [3.5, 7.1, 14.175, 21.2, 28.5, 50.1] as band}
                                <button 
                                    onclick={() => frequency = band}
                                    class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
                                >
                                    {Math.floor(band)}m
                                </button>
                            {/each}
                        </div>
                    </div>

                    <hr class="border-slate-100" />

                    <div>
                        <div class="mb-2 flex items-center justify-between">
                            <label for="vf" class="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                {m.input_vf()}
                            </label>
                            <span class="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {m.label_default({ val: 0.95 })}
                            </span>
                        </div>
                        
                        <div class="relative">
                            <input
                                id="vf"
                                type="number"
                                step="0.01"
                                min="0.5"
                                max="1.0"
                                bind:value={velocityFactor}
                                class="no-spinner w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-lg font-bold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p class="mt-2 text-xs text-slate-500 leading-relaxed">
                            <strong>0.95</strong> {m.vf_help_insulated()} <br/>
                            <strong>0.96-0.98</strong> {m.vf_help_bare()}
                        </p>
                    </div>
                </div>

                <div class="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl ring-1 ring-white/10">
                    <div class="mb-8">
                        <p class="mb-1 text-sm font-bold tracking-widest text-slate-400 uppercase">
                            {m.result_total_len()}
                        </p>
                        <div class="flex items-baseline gap-2">
                            <span class="text-5xl font-black tracking-tighter text-blue-400">{fmt(totalLengthFeet)}</span>
                            <span class="text-xl font-bold text-slate-500">ft</span>
                        </div>
                        <p class="text-lg font-medium text-slate-400 font-mono">
                            {fmt(totalLengthMeters)} m
                        </p>
                    </div>

                    <div class="border-t border-slate-800 pt-8">
                        <p class="mb-1 text-sm font-bold tracking-widest text-slate-400 uppercase">
                            {m.result_leg_len()}
                        </p>
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-bold tracking-tighter text-white">{fmt(legLengthFeet)}</span>
                            <span class="text-lg font-bold text-slate-500">ft</span>
                        </div>
                        <p class="text-sm font-medium text-slate-400 font-mono">
                            {fmt(legLengthMeters)} m
                        </p>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-8 flex flex-col gap-4">
                <div class="flex items-center justify-between">
                     <h2 class="text-sm font-bold tracking-widest text-slate-400 uppercase">{m.visual_title()}</h2>
                     <span class="text-xs text-slate-400">{m.visual_instructions()}</span>
                </div>
               
                <div class="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-900/5">
                    <AntennaViewer 
                        design={design} 
                        height="600px" 
                        options={{
                            showDimensions: true,
                            showGrid: true,
                            showLabels: true,
                            wireThickness: 2,
                            gridOpacity: 0.1
                        }}
                    />
                </div>
            </div>

        </div>
    </main>
    <Footer />
</div>

<style>
    .no-spinner::-webkit-outer-spin-button,
    .no-spinner::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .no-spinner {
        -moz-appearance: textfield;
    }
</style>
