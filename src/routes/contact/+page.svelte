<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import * as m from '$lib/paraglide/messages.js'; // Import all messages
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { loggedIn } from '$lib/clientAuth';
    import { goto } from '$app/navigation';

    let { data } = $props();

    let qsoData = $state(data.existingQso || {
        timestamp: new Date().toISOString().slice(0, 16),
        contactCallsign: '',
        contactGrid: '',
        mode: '',
        frequency: null as number | null,
        band: '',
        rstSent: '',
        rstReceived: '',
        qslSent: false,
        qslReceived: false,
        notes: ''
    });

    const modes = ['SSB', 'CW', 'FT8', 'FT4', 'PSK31', 'RTTY', 'FM', 'AM', 'SSTV', 'JT65', 'JS8'];
    const bands = ['160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '2m', '70cm'];

    function updateBandFromFrequency() {
        if (!qsoData.frequency) return;
        const freq = qsoData.frequency;
        if (freq >= 1.8 && freq <= 2.0) qsoData.band = '160m';
        else if (freq >= 3.5 && freq <= 4.0) qsoData.band = '80m';
        else if (freq >= 5.3 && freq <= 5.4) qsoData.band = '60m';
        else if (freq >= 7.0 && freq <= 7.3) qsoData.band = '40m';
        else if (freq >= 10.1 && freq <= 10.15) qsoData.band = '30m';
        else if (freq >= 14.0 && freq <= 14.35) qsoData.band = '20m';
        else if (freq >= 18.068 && freq <= 18.168) qsoData.band = '17m';
        else if (freq >= 21.0 && freq <= 21.45) qsoData.band = '15m';
        else if (freq >= 24.89 && freq <= 24.99) qsoData.band = '12m';
        else if (freq >= 28.0 && freq <= 29.7) qsoData.band = '10m';
        else if (freq >= 50.0 && freq <= 54.0) qsoData.band = '6m';
        else if (freq >= 144.0 && freq <= 148.0) qsoData.band = '2m';
        else if (freq >= 420.0 && freq <= 450.0) qsoData.band = '70cm';
    }

    function handleSubmit() {
        if (!loggedIn) {
            alert(m.auth_required());
            return;
        }

        const editId = page.url.searchParams.get('editId');
        
        if (editId) {
            let body = { ...qsoData, id: editId };
            fetch('/api/v1/qso/', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).then(async (response) => {
                if (response.ok) {
                    alert(m.update_success());
                    clearForm();
                } else {
                    const errorData = await response.json();
                    alert(m.update_error({ error: errorData.message || m.unknown_error() }));
                }
                goto('/logbook');
            }).catch((error) => {
                alert(m.update_error({ error: error.message }));
            });
        } else {
            fetch('/api/v1/qso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(qsoData)
            }).then(async (response) => {
                if (response.ok) {
                    alert(m.log_success());
                    clearForm();
                } else {
                    const errorData = await response.json();
                    alert(m.log_error({ error: errorData.message || m.unknown_error() }));
                }
                goto('/logbook');
            }).catch((error) => {
                alert(m.log_error({ error: error.message }));
            });
        }
    }

    function clearForm() {
        qsoData = {
            timestamp: new Date().toISOString().slice(0, 16),
            contactCallsign: '',
            contactGrid: '',
            mode: '',
            frequency: null,
            band: '',
            rstSent: '',
            rstReceived: '',
            qslSent: false,
            qslReceived: false,
            notes: ''
        };
    }

    onMount(() => {
        const searchParams = page.url.searchParams;
        const callsign = searchParams.get('callsign');
        const grid = searchParams.get('grid');
        if (callsign) qsoData.contactCallsign = callsign.toUpperCase();
        if (grid) qsoData.contactGrid = grid.toUpperCase();
        
        if (!loggedIn()) {
            goto('/login?redirect=' + encodeURIComponent(page.url.pathname + page.url.search));
        }
    });
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div class="mb-8">
            <h1 class="text-4xl font-black tracking-tight text-slate-900">{m.log_qso_title()}</h1>
            <p class="mt-2 text-slate-600">{m.log_qso_subtitle()}</p>
        </div>

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {m.section_contact_info()}
                </h2>
                
                <div class="grid gap-6 sm:grid-cols-2">
                    <div>
                        <label for="timestamp" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_datetime()}
                        </label>
                        <input
                            type="datetime-local"
                            id="timestamp"
                            bind:value={qsoData.timestamp}
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>

                    <div>
                        <label for="contactCallsign" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_callsign2()}
                        </label>
                        <input
                            type="text"
                            id="contactCallsign"
                            bind:value={qsoData.contactCallsign}
                            placeholder="W1AW"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-lg uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>

                    <div>
                        <label for="contactGrid" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_grid_square()}
                        </label>
                        <input
                            type="text"
                            id="contactGrid"
                            bind:value={qsoData.contactGrid}
                            placeholder="FN31pr"
                            maxlength="8"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div>
                        <label for="mode" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_mode()}
                        </label>
                        <div class="flex gap-2">
                            <select
                                id="mode"
                                bind:value={qsoData.mode}
                                class="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">{m.placeholder_select_mode()}</option>
                                {#each modes as mode}
                                    <option value={mode}>{mode}</option>
                                {/each}
                            </select>
                            <input
                                type="text"
                                bind:value={qsoData.mode}
                                placeholder={m.placeholder_custom()}
                                class="w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {m.section_frequency_band()}
                </h2>
                
                <div class="grid gap-6 sm:grid-cols-2">
                    <div>
                        <label for="frequency" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_frequency()}
                        </label>
                        <input
                            type="number"
                            id="frequency"
                            bind:value={qsoData.frequency}
                            oninput={updateBandFromFrequency}
                            step="0.001"
                            placeholder="14.074"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div>
                        <label for="band" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_band()}
                        </label>
                        <select
                            id="band"
                            bind:value={qsoData.band}
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">{m.placeholder_select_band()}</option>
                            {#each bands as band}
                                <option value={band}>{band}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {m.section_signal_reports()}
                </h2>
                
                <div class="grid gap-6 sm:grid-cols-2">
                    <div>
                        <label for="rstSent" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_rst_sent()}
                        </label>
                        <input
                            type="text"
                            id="rstSent"
                            bind:value={qsoData.rstSent}
                            placeholder="599 or 59 or -12"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p class="mt-1 text-xs text-slate-500">{m.hint_rst_sent()}</p>
                    </div>

                    <div>
                        <label for="rstReceived" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_rst_received()}
                        </label>
                        <input
                            type="text"
                            id="rstReceived"
                            bind:value={qsoData.rstReceived}
                            placeholder="599 or 59 or -08"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p class="mt-1 text-xs text-slate-500">{m.hint_rst_received()}</p>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {m.section_qsl_status()}
                </h2>
                
                <div class="flex flex-wrap gap-6">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={qsoData.qslSent}
                            class="h-5 w-5 rounded border-slate-300 text-blue-600 transition focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span class="text-sm font-bold text-slate-700">{m.label_qsl_sent()}</span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            bind:checked={qsoData.qslReceived}
                            class="h-5 w-5 rounded border-slate-300 text-blue-600 transition focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span class="text-sm font-bold text-slate-700">{m.label_qsl_received()}</span>
                    </label>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {m.section_notes()}
                </h2>
                
                <textarea
                    bind:value={qsoData.notes}
                    rows="4"
                    placeholder={m.placeholder_notes()}
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
            </section>

            <div class="flex gap-3 justify-end">
                <button
                    type="button"
                    onclick={clearForm}
                    class="rounded-lg px-6 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                    {m.btn_clear()}
                </button>
                <button
                    type="submit"
                    class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                    {m.btn_submit()}
                </button>
            </div>
        </form>
    </main>
</div>