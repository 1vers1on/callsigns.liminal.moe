<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { m } from '$lib/paraglide/messages.js';

    let currentLanguage = $state('en');
    let emailNotifications = $state(true);
    let darkMode = $state(false);
    let showDeleteConfirm = $state(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'ja', name: '日本語' }
    ];

    function saveSettings() {
        console.log('Settings saved!');
    }

    function deleteAccount() {
        // TODO: implement actual account deletion
        console.log('Account deleted');
        showDeleteConfirm = false;
    }
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div class="mb-8">
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
            <p class="mt-2 text-slate-600">Manage your account preferences and settings</p>
        </div>

        <div class="space-y-6">
            <!-- Language Settings -->
            <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h2 class="text-lg font-semibold text-slate-900">Language</h2>
                    <p class="mt-1 text-sm text-slate-600">Choose your preferred language</p>
                </div>
                <div class="p-6">
                    <select
                        bind:value={currentLanguage}
                        class="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    >
                        {#each languages as lang}
                            <option value={lang.code}>{lang.name}</option>
                        {/each}
                    </select>
                </div>
            </section>

            <!-- Notification Settings -->
            <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h2 class="text-lg font-semibold text-slate-900">Notifications</h2>
                    <p class="mt-1 text-sm text-slate-600">Manage how you receive updates</p>
                </div>
                <div class="p-6">
                    <label class="flex cursor-pointer items-center justify-between">
                        <div>
                            <div class="font-medium text-slate-900">Email Notifications</div>
                            <div class="text-sm text-slate-600">
                                Receive propagation updates via email
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            bind:checked={emailNotifications}
                            class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </label>
                </div>
            </section>

            <!-- Appearance Settings -->
            <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <div class="border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <h2 class="text-lg font-semibold text-slate-900">Appearance</h2>
                    <p class="mt-1 text-sm text-slate-600">Customize how the app looks</p>
                </div>
                <div class="p-6">
                    <label class="flex cursor-pointer items-center justify-between">
                        <div>
                            <div class="font-medium text-slate-900">Dark Mode</div>
                            <div class="text-sm text-slate-600">
                                Use dark theme throughout the app
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            bind:checked={darkMode}
                            class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </label>
                </div>
            </section>

            <!-- Save Button -->
            <div class="flex justify-end">
                <button
                    onclick={saveSettings}
                    class="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                >
                    Save Changes
                </button>
            </div>

            <!-- <section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-red-200">
                <div class="border-b border-red-200 bg-red-50 px-6 py-4">
                    <h2 class="text-lg font-semibold text-red-900">Danger Zone</h2>
                    <p class="mt-1 text-sm text-red-700">Irreversible actions</p>
                </div>
                <div class="p-6">
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="font-medium text-slate-900">Delete Account</div>
                            <div class="text-sm text-slate-600">
                                Permanently delete your account and all associated data
                            </div>
                        </div>
                        <button
                            onclick={() => (showDeleteConfirm = true)}
                            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </section> -->
        </div>
    </main>
</div>

<!-- {#if showDeleteConfirm}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 class="text-xl font-bold text-slate-900">Delete Account?</h3>
            <p class="mt-2 text-slate-600">
                This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div class="mt-6 flex gap-3">
                <button
                    onclick={() => (showDeleteConfirm = false)}
                    class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button
                    onclick={deleteAccount}
                    class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if} -->
