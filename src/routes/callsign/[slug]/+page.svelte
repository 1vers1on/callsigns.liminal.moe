<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import type { OperatorProfile } from '$lib/types';
    import type { PageProps } from './$types';
    import { m } from '$lib/paraglide/messages.js';

    let { data }: PageProps = $props();

    let currentUserCallsign = 'G1ABC';
    let operator: OperatorProfile = $derived(data.operator);
    let isOwner = $derived(currentUserCallsign === operator.callsign);
    let isEditing = $state(false);

    let mapUrl = $derived(
        `https://www.openstreetmap.org/export/embed.html?bbox=-2.4172%2C51.3533%2C-2.3172%2C51.4133&layer=mapnik&marker=51.3811%2C-2.3590`
    );

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'expired':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    let flagUrl = $derived(`https://flagcdn.com/w80/${operator.countryCode.toLowerCase()}.png`);

    function toggleEdit() {
        if (isEditing) {
            console.log('Saving changes...', operator);
        }
        isEditing = !isEditing;
    }
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <nav class="mb-6 flex items-center justify-between">
            <a
                href="/"
                class="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                {m.back_to_search()}
            </a>

            {#if isOwner}
                <button
                    onclick={toggleEdit}
                    class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition {isEditing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {#if isEditing}
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                            />
                        {:else}
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        {/if}
                    </svg>
                    {isEditing ? m.save_changes() : m.edit_profile()}
                </button>
            {/if}
        </nav>

        <div class="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div class="flex items-start gap-5">
                <div class="relative">
                    <img
                        src={flagUrl}
                        alt={operator.countryCode}
                        class="h-auto w-16 rounded border border-slate-200 shadow-sm"
                    />
                </div>
                <div>
                    <div class="mb-1 flex items-center gap-3">
                        <h1 class="text-5xl font-black tracking-tighter text-slate-900">
                            {operator.callsign}
                        </h1>
                        {#if operator.status}
                            <span
                                class="inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-bold {getStatusColor(
                                    operator.status
                                )}"
                            >
                                {operator.status.toUpperCase()}
                            </span>
                        {/if}
                    </div>
                    <p class="text-xl font-medium text-slate-600">
                        {operator.name}
                        {#if operator.nickname}
                            <span class="ml-1 font-normal text-slate-400"
                                >"{operator.nickname}"</span
                            >
                        {/if}
                    </p>
                </div>
            </div>

            <div class="flex gap-2">
                <button
                    class="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                    {m.log_contact()}
                </button>
                <button
                    class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                    {m.share_profile()}
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="space-y-6 lg:col-span-2">
                <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
                        {m.personal_details()}
                    </h2>
                    <div class="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
                        <div>
                            <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                {m.label_nickname()}
                            </p>
                            {#if isEditing}
                                <input
                                    bind:value={operator.nickname}
                                    class="w-3/4 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            {:else}
                                <p class="text-lg font-bold text-slate-800">
                                    {operator.nickname || '—'}
                                </p>
                            {/if}
                        </div>

                        <div>
                            <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                {m.label_gender()}
                            </p>
                            {#if isEditing}
                                <select
                                    bind:value={operator.gender}
                                    class="rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{m.gender_private()}</option>
                                    <option value="Male">{m.gender_male()}</option>
                                    <option value="Female">{m.gender_female()}</option>
                                    <option value="Non-binary">{m.gender_non_binary()}</option>
                                </select>
                            {:else}
                                <p class="text-lg font-bold text-slate-800">
                                    {operator.gender || '—'}
                                </p>
                            {/if}
                        </div>

                        <div>
                            <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                {m.label_birthday()}
                            </p>
                            {#if isEditing}
                                <input
                                    type="date"
                                    bind:value={operator.birthday}
                                    class="rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            {:else}
                                <p class="text-lg font-bold text-slate-800">
                                    {operator.birthday || '—'}
                                </p>
                            {/if}
                        </div>

                        <div>
                            <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                {m.label_age()}
                            </p>
                            {#if isEditing}
                                <input
                                    type="number"
                                    bind:value={operator.age}
                                    class="w-20 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            {:else}
                                <p class="text-lg font-bold text-slate-800">
                                    {operator.age || '—'}
                                </p>
                            {/if}
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
                        {m.license_information()}
                    </h2>
                    <div class="grid grid-cols-2 gap-y-8 sm:grid-cols-3">
                        {#if operator.class}
                            <div>
                                <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                    {m.label_class()}
                                </p>
                                <p class="text-lg font-bold text-slate-800">{operator.class}</p>
                            </div>
                        {/if}
                        {#if operator.identifiers?.dmrId}
                            <div>
                                <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                    {m.label_dmr_id()}
                                </p>
                                <p class="font-mono text-lg font-bold text-blue-600">
                                    {operator.identifiers.dmrId}
                                </p>
                            </div>
                        {/if}
                        {#if operator.joined}
                            <div>
                                <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                    {m.label_grant_date()}
                                </p>
                                <p class="font-semibold text-slate-700">{operator.joined}</p>
                            </div>
                        {/if}
                    </div>
                </section>

                {#if operator.address}
                    <section
                        class="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <h2 class="mb-6 text-sm font-bold tracking-widest text-slate-400 uppercase">
                            {m.location_geography()}
                        </h2>
                        <div class="flex flex-col gap-8 md:flex-row">
                            <div class="flex-1 space-y-6">
                                <div>
                                    <p class="mb-2 text-xs font-bold text-slate-400 uppercase">
                                        {m.label_registered_region()}
                                    </p>
                                    <p class="text-lg leading-tight font-bold text-slate-800">
                                        {#if operator.address.city}{operator.address.city},
                                        {/if}
                                        {#if operator.address.state}{operator.address.state}{/if}
                                    </p>
                                    <p class="font-medium text-slate-500">
                                        {operator.address.country}
                                    </p>
                                </div>

                                {#if operator.address.grid}
                                    <div>
                                        <p class="mb-1 text-xs font-bold text-slate-400 uppercase">
                                            {m.label_maidenhead_grid()}
                                        </p>
                                        <div class="flex items-baseline gap-2">
                                            <p
                                                class="font-mono text-3xl font-black tracking-tight text-blue-600"
                                            >
                                                {operator.address.grid}
                                            </p>
                                            <span class="text-xs font-bold text-slate-300 uppercase"
                                                >IO81wv</span
                                            >
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <div
                                class="relative h-56 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner md:w-80"
                            >
                                <iframe
                                    title="Operator Location Map"
                                    width="100%"
                                    height="100%"
                                    frameborder="0"
                                    scrolling="no"
                                    marginheight="0"
                                    marginwidth="0"
                                    src={mapUrl}
                                    class="contrast-[90%] grayscale-[20%] filter"
                                ></iframe>
                                <div
                                    class="pointer-events-none absolute right-2 bottom-2 rounded border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-500 backdrop-blur"
                                >
                                    {m.map_attribution()}
                                </div>
                            </div>
                        </div>
                    </section>
                {/if}
            </div>

            <div class="space-y-6">
                <div class="rounded-2xl bg-slate-900 p-6 text-white shadow-xl ring-1 ring-white/10">
                    <h3 class="mb-4 flex items-center gap-2 text-lg font-bold">
                        <span class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
                        {m.station_tools()}
                    </h3>
                    <ul class="space-y-3">
                        <li>
                            <button
                                class="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                            >
                                <svg
                                    class="h-5 w-5 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    />
                                </svg>
                                {m.button_calculate_distance()}
                            </button>
                        </li>
                    </ul>
                </div>

                <div class="rounded-2xl border border-dashed border-slate-300 p-6">
                    <p class="mb-2 text-center text-xs font-bold text-slate-400 uppercase">
                        {m.label_equipment_bio()}
                    </p>

                    {#if isEditing}
                        <textarea
                            bind:value={operator.bio}
                            rows="4"
                            class="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={m.placeholder_bio()}
                        ></textarea>
                    {:else}
                        <p class="text-center text-sm text-slate-500 italic">
                            {operator.bio || '—'}
                        </p>
                    {/if}
                </div>
            </div>
        </div>
    </main>
</div>
