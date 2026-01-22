<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    import { m } from '$lib/paraglide/messages.js';

    let { form }: { form: ActionData } = $props();

    let email = $state('');
    let password = $state('');
    let isLoading = $state(false);

    const handleEnhance = () => {
        isLoading = true;

        return async ({ update }: { update: () => Promise<void> }) => {
            await update();
            isLoading = false;
        };
    };
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <div class="rounded-2xl bg-white p-8 shadow-xl ring-1 shadow-slate-200/50 ring-slate-200">
            <div class="mb-8 text-center">
                <h1 class="text-2xl font-bold text-slate-900">{m.login_title()}</h1>
                <p class="mt-2 text-sm text-slate-500">{m.login_subtitle()}</p>
            </div>

            {#if form?.error}
                <div
                    class="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-rose-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    {form.error}
                </div>
            {/if}

            <form method="POST" action="?/login" class="space-y-5" use:enhance={handleEnhance}>
                <div>
                    <label for="email" class="block text-sm font-semibold text-slate-700"
                        >{m.label_email()}</label
                    >
                    <input
                        id="email"
                        type="email"
                        name="email"
                        bind:value={email}
                        required
                        placeholder={m.placeholder_email()}
                        class="mt-1.5 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>

                <div>
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm font-semibold text-slate-700"
                            >{m.label_password()}</label
                        >
                        <a
                            href="/forgot-password"
                            class="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >{m.button_forgot_password()}</a
                        >
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        bind:value={password}
                        required
                        placeholder="••••••••"
                        class="mt-1.5 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    class="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                    {#if isLoading}
                        {m.button_logging_in()}
                    {:else}
                        {m.button_login()}
                    {/if}
                </button>
            </form>

            <div class="mt-8 text-center">
                <p class="text-sm text-slate-500">
                    {m.no_account_prompt()}
                    <a href="/register" class="font-bold text-blue-600 hover:text-blue-700">
                        {m.register_link()}
                    </a>
                </p>
            </div>
        </div>
    </main>
</div>
z
