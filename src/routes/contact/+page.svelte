<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import * as m from '$lib/paraglide/messages.js';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { loggedIn } from '$lib/clientAuth';
    import { getAccessToken } from '$lib/storage.svelte';
    import { goto } from '$app/navigation';

    let { data } = $props();

    let qsoData = $state(
        data.existingQso || {
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
        }
    );

    const modes = [
        'SSB',
        'CW',
        'FT8',
        'FT4',
        'PSK31',
        'RTTY',
        'FM',
        'AM',
        'SSTV',
        'JT65',
        'JS8',
        'OLIVIA',
        'MFSK',
        'WSPR',
        'Q65',
        'JT9',
        'PACTOR',
        'VARA',
        'FST4',
        'FST4W',
        'DOMINO',
        'THOR',
        'CONTESTIA',
        'ATV'
    ];

    const bands = [
        '2200m',
        '630m',
        '160m',
        '80m',
        '60m',
        '40m',
        '30m',
        '20m',
        '17m',
        '15m',
        '12m',
        '10m',
        '6m',
        '4m',
        '2m',
        '1.25m',
        '70cm',
        '33cm',
        '23cm'
    ];

    const bandPlan = [
        { name: '2200m', lower: 0.1357, upper: 0.1378 },
        { name: '630m', lower: 0.472, upper: 0.479 },
        { name: '160m', lower: 1.8, upper: 2.0 },
        { name: '80m', lower: 3.5, upper: 4.0 },
        { name: '60m', lower: 5.3305, upper: 5.405 },
        { name: '40m', lower: 7.0, upper: 7.3 },
        { name: '30m', lower: 10.1, upper: 10.15 },
        { name: '20m', lower: 14.0, upper: 14.35 },
        { name: '17m', lower: 18.068, upper: 18.168 },
        { name: '15m', lower: 21.0, upper: 21.45 },
        { name: '12m', lower: 24.89, upper: 24.99 },
        { name: '10m', lower: 28.0, upper: 29.7 },
        { name: '6m', lower: 50.0, upper: 54.0 },
        { name: '2m', lower: 144.0, upper: 148.0 },
        { name: '1.25m', lower: 222.0, upper: 225.0 },
        { name: '70cm', lower: 420.0, upper: 450.0 },
        { name: '33cm', lower: 902.0, upper: 928.0 },
        { name: '23cm', lower: 1240.0, upper: 1300.0 }
    ];

    function updateBandFromFrequency() {
        if (!qsoData.frequency) return;

        const freq = parseFloat(qsoData.frequency);

        const band = bandPlan.find((b) => freq >= b.lower && freq <= b.upper);

        if (band) {
            qsoData.band = band.name;
        } else {
            qsoData.band = '';
        }
    }

    function handleSubmit() {
        if (!loggedIn()) {
            alert(m.auth_required());
            return;
        }

        const accessToken = getAccessToken();
        if (!accessToken) {
            alert(m.auth_required());
            goto('/login?redirect=' + encodeURIComponent(page.url.pathname + page.url.search));
            return;
        }

        const editId = page.url.searchParams.get('editId');

        if (editId) {
            let body = { ...qsoData, id: editId };
            fetch('/api/v1/qso/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(body)
            })
                .then(async (response) => {
                    if (response.ok) {
                        alert(m.update_success());
                        clearForm();
                    } else {
                        const errorData = await response.json();
                        alert(m.update_error({ error: errorData.message || m.unknown_error() }));
                    }
                    goto('/logbook');
                })
                .catch((error) => {
                    alert(m.update_error({ error: error.message }));
                });
        } else {
            fetch('/api/v1/qso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(qsoData)
            })
                .then(async (response) => {
                    if (response.ok) {
                        alert(m.log_success());
                        clearForm();
                    } else {
                        const errorData = await response.json();
                        alert(m.log_error({ error: errorData.message || m.unknown_error() }));
                    }
                    goto('/logbook');
                })
                .catch((error) => {
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

        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            class="space-y-6"
        >
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
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
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>

                    <div>
                        <label
                            for="contactCallsign"
                            class="mb-2 block text-sm font-bold text-slate-700"
                        >
                            {m.label_callsign2()}
                        </label>
                        <input
                            type="text"
                            id="contactCallsign"
                            bind:value={qsoData.contactCallsign}
                            placeholder="W1AW"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-lg text-slate-900 uppercase transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>

                    <div>
                        <label
                            for="contactGrid"
                            class="mb-2 block text-sm font-bold text-slate-700"
                        >
                            {m.label_grid_square()}
                        </label>
                        <input
                            type="text"
                            id="contactGrid"
                            bind:value={qsoData.contactGrid}
                            placeholder="FN31pr"
                            maxlength="8"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 uppercase transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                                class="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                                class="w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
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
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <div>
                        <label for="band" class="mb-2 block text-sm font-bold text-slate-700">
                            {m.label_band()}
                        </label>
                        <select
                            id="band"
                            bind:value={qsoData.band}
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
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
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p class="mt-1 text-xs text-slate-500">{m.hint_rst_sent()}</p>
                    </div>

                    <div>
                        <label
                            for="rstReceived"
                            class="mb-2 block text-sm font-bold text-slate-700"
                        >
                            {m.label_rst_received()}
                        </label>
                        <input
                            type="text"
                            id="rstReceived"
                            bind:value={qsoData.rstReceived}
                            placeholder="599 or 59 or -08"
                            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p class="mt-1 text-xs text-slate-500">{m.hint_rst_received()}</p>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
                    {m.section_qsl_status()}
                </h2>

                <div class="flex flex-wrap gap-6">
                    <label class="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            bind:checked={qsoData.qslSent}
                            class="h-5 w-5 rounded border-slate-300 text-blue-600 transition focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span class="text-sm font-bold text-slate-700">{m.label_qsl_sent()}</span>
                    </label>

                    <label class="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            bind:checked={qsoData.qslReceived}
                            class="h-5 w-5 rounded border-slate-300 text-blue-600 transition focus:ring-2 focus:ring-blue-500/20"
                        />
                        <span class="text-sm font-bold text-slate-700"
                            >{m.label_qsl_received()}</span
                        >
                    </label>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
                    {m.section_notes()}
                </h2>

                <textarea
                    bind:value={qsoData.notes}
                    rows="4"
                    placeholder={m.placeholder_notes()}
                    class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                ></textarea>
            </section>

            <div class="flex justify-end gap-3">
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
