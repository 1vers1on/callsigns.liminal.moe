<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    import { m } from '$lib/paraglide/messages.js';

    let { data } = $props();
    let searchInput = $state(data.searchQuery || '');
    let isSearching = $state(false);

    function handleSearch() {
        isSearching = true;
        goto(`?q=${encodeURIComponent(searchInput)}`, {
            replaceState: true,
            keepFocus: true,
            noScroll: true
        }).finally(() => (isSearching = false));
    }
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 class="text-2xl font-bold text-slate-900">{m.user_mangement()}</h1>
                <p class="text-sm text-slate-500">
                    {m.manage_accounts({ num_users: data.users.length })}
                </p>
            </div>

            <div class="relative w-full max-w-md">
                <input
                    type="text"
                    placeholder="Search email or Callsign..."
                    bind:value={searchInput}
                    oninput={handleSearch}
                    class="w-full rounded-xl border border-slate-200 bg-white py-3 pr-10 pl-4 shadow-sm transition-all outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                {#if isSearching}
                    <div
                        class="absolute top-3.5 right-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
                    ></div>
                {/if}
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:hidden">
            {#each data.users as user (user.id)}
                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div class="flex items-start justify-between border-b border-slate-50 pb-3">
                        <div class="min-w-0">
                            <div class="truncate font-bold text-slate-900">{user.email}</div>
                            <div class="font-mono text-xs text-slate-400">ID: {user.id}</div>
                        </div>
                        {#if user.admin}
                            <span
                                class="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-blue-700/10"
                                >{m.admin_label()}</span
                            >
                        {/if}
                    </div>

                    <div class="mt-4 flex gap-2">
                        <form method="POST" action="?/toggleAdmin" use:enhance class="flex-1">
                            <input type="hidden" name="id" value={user.id} />
                            <input type="hidden" name="currentStatus" value={user.admin} />
                            <button
                                class="w-full rounded-lg py-2 text-xs font-bold transition-colors {user.admin
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-blue-600 text-white'}"
                            >
                                {user.admin ? m.demote_user() : m.make_admin()}
                            </button>
                        </form>

                        <form method="POST" action="?/deleteUser" use:enhance>
                            <input type="hidden" name="id" value={user.id} />
                            <button
                                onclick={(e) =>
                                    !confirm(m.delete_user_confirm()) && e.preventDefault()}
                                class="rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600"
                            >
                                {m.delete_user()}
                            </button>
                        </form>
                    </div>
                </div>
            {:else}
                <div class="py-10 text-center text-slate-400">{m.no_users_found()}</div>
            {/each}
        </div>

        <div
            class="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block"
        >
            <table class="w-full table-fixed divide-y divide-slate-200 text-left text-sm">
                <thead class="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                        <th class="w-1/2 px-6 py-4">{m.label_user()}</th>
                        <th class="w-1/4 px-6 py-4 text-center">{m.label_role()}</th>
                        <th class="w-1/4 px-6 py-4 text-right">{m.label_actions()}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    {#each data.users as user (user.id)}
                        <tr class="transition-colors hover:bg-slate-50/50">
                            <td class="truncate px-6 py-4">
                                <div class="truncate font-medium text-slate-900">{user.email}</div>
                                <div class="font-mono text-[10px] text-slate-400">
                                    ID: {user.id}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                {#if user.admin}
                                    <span
                                        class="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-700/10"
                                        >{m.admin_label()}</span
                                    >
                                {:else}
                                    <span class="text-xs text-slate-400 uppercase"
                                        >{m.label_user()}</span
                                    >
                                {/if}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-3">
                                    <form method="POST" action="?/toggleAdmin" use:enhance>
                                        <input type="hidden" name="id" value={user.id} />
                                        <input
                                            type="hidden"
                                            name="currentStatus"
                                            value={user.admin}
                                        />
                                        <button
                                            class="text-xs font-bold {user.admin
                                                ? 'text-slate-400'
                                                : 'text-blue-600'}"
                                        >
                                            {user.admin ? m.demote_user() : m.make_admin()}
                                        </button>
                                    </form>
                                    <form method="POST" action="?/deleteUser" use:enhance>
                                        <input type="hidden" name="id" value={user.id} />
                                        <button
                                            onclick={(e) =>
                                                !confirm(m.delete_user_confirm()) &&
                                                e.preventDefault()}
                                            class="text-xs font-bold text-red-500"
                                        >
                                            {m.delete_user()}
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </main>
</div>
