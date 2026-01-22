<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import { m } from '$lib/paraglide/messages.js';
</script>

<div class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
    <Header />

    <main class="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <div
            class="rounded-2xl bg-white p-8 text-center shadow-xl ring-1 shadow-slate-200/50 ring-slate-200"
        >
            <div
                class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
            </div>

            <h1 class="text-2xl font-bold text-slate-900">
                {m.verify_email_title()}
            </h1>

            <p class="mt-4 leading-relaxed text-slate-600">
                {m.verify_email_message()}
            </p>

            <div class="mt-8 space-y-4 border-t border-slate-100 pt-6">
                <!-- <p class="text-sm text-slate-500">
                    {m.verify_email_resend_prompt()}
                    <button class="font-bold text-blue-600 hover:text-blue-700 transition">
                        {m.verify_email_resend_link()}
                    </button>
                </p> -->

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
