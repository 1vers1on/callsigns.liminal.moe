<script>
    import { m } from '$lib/paraglide/messages.js';
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
</script>

<div class="mx-auto max-w-3xl px-4 py-12 text-slate-800">
    <Header />
    <br />
    <h1 class="mb-6 text-3xl font-bold">Terms of Service</h1>
    <p class="mb-4 text-sm text-slate-500">Last Updated: January 2026</p>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">1. Acceptance of Terms</h2>
        <p>
            By creating an account or using HamLookup, you agree to these terms. If you do not
            agree, please do not use the service.
        </p>
    </section>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">2. Data Accuracy & "As-Is" Clause</h2>
        <p>
            Solar propagation data and callsign records are provided for informational purposes
            only. HamLookup does not guarantee the accuracy, completeness, or timeliness of this
            data.
            <strong>This service should not be relied upon for emergency communications.</strong>
        </p>
    </section>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">3. User Conduct</h2>
        <p>
            You agree not to use automated tools (scripts, crawlers, or scrapers) to access our
            database without prior permission. You are responsible for maintaining the security of
            your account password.
        </p>
    </section>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">4. Limitation of Liability</h2>
        <p>
            HamLookup and its creators shall not be liable for any damages arising from your use of
            the site, including but not limited to incorrect propagation predictions or license data
            errors.
        </p>
    </section>

    <section>
        <h2 class="mb-3 text-xl font-semibold">5. Contact</h2>
        <p>Legal inquiries can be directed to: <strong>elliehartung@outlook.com</strong></p>
    </section>
    <br />
    <Footer />
</div>
