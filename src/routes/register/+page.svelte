<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { validateHamCallsign } from '$lib/callsignValidation';
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    import { m } from '$lib/paraglide/messages.js';
    import { Turnstile } from 'svelte-turnstile';

    let { form }: { form: ActionData } = $props();

    let callsign = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let isLoading = $state(false);
    let turnstileToken = $state('');

    let isCallsignValid = $derived(callsign.length > 0 ? validateHamCallsign(callsign) : null);
    let isPasswordLongEnough = $derived(password.length >= 6);
    let passwordsMatch = $derived(password === confirmPassword && confirmPassword.length > 0);

    let acceptedTerms = $state(false);

    let canSubmit = $derived(
        isCallsignValid === true &&
            isPasswordLongEnough &&
            passwordsMatch &&
            acceptedTerms &&
            turnstileToken.length > 0 &&
            !isLoading
    );

    const handleEnhance = () => {
        isLoading = true;

        return async ({ update }: { update: () => Promise<void> }) => {
            await update();
            isLoading = false;
        };
    };
</script>

<div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
    <Header />

    <main class="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <div class="rounded-2xl bg-white p-8 shadow-xl ring-1 shadow-slate-200/50 ring-slate-200">
            <div class="mb-8 text-center">
                <h1 class="text-2xl font-bold text-slate-900">{m.register_title()}</h1>
                <p class="mt-2 text-sm text-slate-500">{m.register_subtitle()}</p>
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

            <form method="POST" action="?/register" class="space-y-5" use:enhance={handleEnhance}>
                <div>
                    <label for="callsign" class="block text-sm font-semibold text-slate-700">
                        {m.label_callsign()}
                    </label>
                    <div class="relative mt-1.5 flex items-center">
                        <input
                            id="callsign"
                            type="text"
                            bind:value={callsign}
                            name="callsign"
                            required
                            placeholder={m.placeholder_callsign()}
                            class="w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-lg font-bold tracking-widest uppercase transition-all outline-none
                            {isCallsignValid === true
                                ? 'border-emerald-500 bg-emerald-50/30 focus:ring-emerald-100'
                                : isCallsignValid === false
                                  ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-100'
                                  : 'border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'}"
                        />
                    </div>
                </div>

                <div>
                    <label for="email" class="block text-sm font-semibold text-slate-700">
                        {m.label_email()}
                    </label>
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
                    <label for="password" class="block text-sm font-semibold text-slate-700">
                        {m.label_password()}
                    </label>
                    <input
                        id="password"
                        type="password"
                        bind:value={password}
                        name="password"
                        required
                        placeholder="••••••••"
                        class="mt-1.5 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                        {password.length > 0 && !isPasswordLongEnough
                            ? 'border-rose-500 bg-rose-50/30'
                            : 'border-slate-200'}"
                    />
                    {#if password.length > 0 && !isPasswordLongEnough}
                        <p class="mt-1.5 text-xs font-medium text-rose-600">
                            {m.error_password_too_short()}
                        </p>
                    {/if}
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-semibold text-slate-700">
                        {m.label_confirm_password()}
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        bind:value={confirmPassword}
                        required
                        name="confirmPassword"
                        placeholder="••••••••"
                        class="mt-1.5 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                        {confirmPassword.length > 0 && !passwordsMatch
                            ? 'border-rose-500 bg-rose-50/30'
                            : 'border-slate-200'}"
                    />
                    {#if confirmPassword.length > 0 && !passwordsMatch}
                        <p class="mt-1.5 text-xs font-medium text-rose-600">
                            {m.error_passwords_mismatch()}
                        </p>
                    {/if}
                </div>

                <div class="flex items-start gap-3 px-1">
                    <div class="flex h-5 items-center">
                        <input
                            id="terms"
                            type="checkbox"
                            bind:checked={acceptedTerms}
                            required
                            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <label for="terms" class="text-xs leading-tight text-slate-500">
                        {m.register_terms_prefix()}
                        <a
                            href="/terms"
                            class="font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600"
                        >
                            {m.footer_terms()}
                        </a>
                        {m.register_terms_middle()}
                        <a
                            href="/privacy"
                            class="font-semibold text-slate-900 underline underline-offset-2 hover:text-blue-600"
                        >
                            {m.footer_privacy()}
                        </a>
                    </label>
                </div>

                <div class="flex justify-center">
                    <Turnstile
                        theme="light"
                        siteKey="0x4AAAAAACOLKKakXcahTIh2"
                        on:callback={(e) => {
                            turnstileToken = e.detail.token;
                        }}
                    />
                </div>

                <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />

                <button
                    type="submit"
                    disabled={!canSubmit}
                    class="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {#if isLoading}
                        <span class="flex items-center justify-center gap-2">
                            {m.button_creating_account()}
                        </span>
                    {:else}
                        {m.button_create_account()}
                    {/if}
                </button>
            </form>

            <div class="mt-8 text-center">
                <p class="text-sm text-slate-500">
                    {m.login_prompt()}
                    <a href="/login" class="font-bold text-blue-600 hover:text-blue-700">
                        {m.login_link()}
                    </a>
                </p>
            </div>
        </div>
    </main>
</div>
