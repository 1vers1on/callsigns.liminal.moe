<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
    import AntennaViewer from '$lib/components/AntennaVisualizer.svelte';
    import type { AntennaDesign, AntennaElement } from '$lib/components/AntennaVisualizer.svelte';

    let frequency = $state(144.200);
    let directorCount = $state(1);
    let velocityFactor = $state(0.96);
    
    const C_LIGHT = 299792458; 

    let lambda = $derived((C_LIGHT / (frequency * 1000000)) * velocityFactor);

    let reflectorLen = $derived(lambda * 0.495);
    let drivenLen = $derived(lambda * 0.473);
    let directorLen = $derived(lambda * 0.440);
    
    let reflectorSpacing = $derived(lambda * 0.125);
    let directorSpacing = $derived(lambda * 0.125);

    let design = $derived.by<AntennaDesign>(() => {
        const elements: AntennaElement[] = [];

        elements.push({
            id: 'boom',
            type: 'boom',
            points: [{x: 0, y: -reflectorSpacing}, {x: 0, y: directorSpacing * directorCount}],
            group: 'Boom'
        });

        elements.push({
            id: 'reflector',
            type: 'wire',
            points: [{x: -reflectorLen/2, y: -reflectorSpacing}, {x: reflectorLen/2, y: -reflectorSpacing}],
            label: 'Reflector',
            showDimensions: true,
            group: 'Reflector'
        });

        const gap = 0.02;
        elements.push({
            id: 'driven-l',
            type: 'wire',
            points: [{x: -drivenLen/2, y: 0}, {x: -gap, y: 0}],
            isDriven: true,
            group: 'Radiator'
        });
        elements.push({
            id: 'driven-r',
            type: 'wire',
            points: [{x: gap, y: 0}, {x: drivenLen/2, y: 0}],
            isDriven: true,
            label: 'Driven Element',
            showDimensions: true,
            group: 'Radiator'
        });

        for(let i = 1; i <= directorCount; i++) {
            const yPos = directorSpacing * i;
            const taperedLen = directorLen * (1 - (i-1) * 0.01); 
            elements.push({
                id: `dir-${i}`,
                type: 'wire',
                points: [{x: -taperedLen/2, y: yPos}, {x: taperedLen/2, y: yPos}],
                label: `Director ${i}`,
                showDimensions: true,
                group: 'Director'
            });
        }

        return {
            name: `${directorCount + 2} Element Yagi`,
            frequency: frequency,
            feedGap: 0.05,
            elements
        };
    });

    const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 3, minimumFractionDigits: 3 });
</script>

<div class="min-h-screen bg-slate-50 pb-20">
    <Header />

    <main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <header class="mb-10 text-center">
            <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h1 class="text-4xl font-black tracking-tight text-slate-900">Yagi-Uda</h1>
            <p class="mt-2 text-lg font-medium text-slate-500">Directional beam antenna design.</p>
        </header>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div class="space-y-6 lg:col-span-4">
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    <div>
                        <label class="mb-2 block text-xs font-bold tracking-widest text-slate-400 uppercase">Frequency (MHz)</label>
                        <input type="number" step="0.001" bind:value={frequency} class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xl font-bold text-blue-600 outline-none" />
                    </div>

                    <div>
                        <label class="mb-2 block text-xs font-bold tracking-widest text-slate-400 uppercase">Directors: {directorCount}</label>
                        <input type="range" min="1" max="10" bind:value={directorCount} class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>

                    <div>
                        <label class="mb-2 block text-xs font-bold tracking-widest text-slate-400 uppercase">Velocity Factor</label>
                        <input type="number" step="0.01" bind:value={velocityFactor} class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-lg font-bold" />
                    </div>
                </div>

                <div class="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                    <div class="space-y-4">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase">Reflector Length</p>
                            <p class="text-2xl font-bold">{fmt(reflectorLen)} m</p>
                        </div>
                        <div class="border-t border-slate-800 pt-4">
                            <p class="text-xs font-bold text-blue-400 uppercase">Driven Element</p>
                            <p class="text-2xl font-bold">{fmt(drivenLen)} m</p>
                        </div>
                        <div class="border-t border-slate-800 pt-4">
                            <p class="text-xs font-bold text-slate-400 uppercase">Director Length</p>
                            <p class="text-2xl font-bold">{fmt(directorLen)} m</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-8">
                <div class="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-900/5 bg-slate-950">
                    <AntennaViewer 
                        design={design} 
                        height="600px" 
                        options={{
                            showDimensions: true,
                            showGrid: true,
                            showLabels: true,
                            wireThickness: 3,
                            gridOpacity: 0.05
                        }}
                    />
                </div>
            </div>
        </div>
    </main>
    <Footer />
</div>
