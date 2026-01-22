<script lang="ts">
    import { m } from '$lib/paraglide/messages.js';

    let currentYear = new Date().getFullYear();
</script>

<footer class="mt-auto border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div class="col-span-1 md:col-span-1">
                <div class="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <svg
                        class="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                    </svg>
                    <span>HamLookup</span>
                </div>
                <p class="mt-4 text-sm leading-relaxed text-slate-500">
                    {m.footer_tagline()}
                </p>
            </div>

            <div>
                <h3 class="text-sm font-semibold tracking-wider text-slate-900 uppercase">
                    {m.footer_resources_heading()}
                </h3>
                <ul class="mt-4 space-y-2">
                    <li>
                        <a
                            href="/about"
                            class="text-sm text-slate-600 transition-colors hover:text-blue-600"
                        >
                            {m.footer_link_about()}
                        </a>
                    </li>
                    <li>
                        <a
                            href="/solar"
                            class="text-sm text-slate-600 transition-colors hover:text-blue-600"
                        >
                            {m.solar_propagation_title()}
                        </a>
                    </li>
                </ul>
            </div>

            <div>
                <h3 class="text-sm font-semibold tracking-wider text-slate-900 uppercase">
                    {m.footer_connect_heading()}
                </h3>
                <ul class="mt-4 space-y-2">
                    <li>
                        <a
                            href="https://github.com"
                            class="text-sm text-slate-600 transition-colors hover:text-blue-600"
                        >
                            GitHub
                        </a>
                    </li>
                    <li>
                        <a
                            href="mailto:elliehartung@outlook.com"
                            class="text-sm text-slate-600 transition-colors hover:text-blue-600"
                        >
                            {m.footer_link_contact()}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div
            class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row"
        >
            <p class="text-xs text-slate-400">
                &copy; {currentYear} Ellie H. {m.footer_credits()}
            </p>
            <div class="flex gap-6">
                <a href="/privacy" class="text-xs text-slate-400 hover:text-slate-600"
                    >{m.footer_privacy()}</a
                >
                <a href="/terms" class="text-xs text-slate-400 hover:text-slate-600"
                    >{m.footer_terms()}</a
                >
            </div>
        </div>
    </div>
</footer>
