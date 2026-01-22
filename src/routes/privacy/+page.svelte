<script>
    import Footer from '$lib/components/footer.svelte';
    import Header from '$lib/components/header.svelte';
    import { m } from '$lib/paraglide/messages.js';
</script>

<div class="mx-auto max-w-3xl px-4 py-12 text-slate-800">
    <Header />
    <br />
    <h1 class="mb-6 text-3xl font-bold">Privacy Policy</h1>
    <p class="mb-4 text-sm text-slate-500">Last Updated: January 2026</p>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">1. Data We Collect</h2>
        <p class="mb-2">When you create an account, we collect the following information:</p>
        <ul class="list-disc space-y-1 pl-6">
            <li>Email address</li>
            <li>Password (encrypted)</li>
            <li>Callsign</li>
        </ul>
        <p class="mt-2">
            We do <strong>not</strong> use third-party tracking cookies or analytics tools.
        </p>
    </section>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">2. Public Amateur Radio Data</h2>
        <p>
            Our service displays and stores data sourced from public government databases (such as
            the FCC ULS). This information—including names and mailing addresses associated with
            amateur radio licenses—is considered public record. We are not the originators of this
            data.
        </p>
    </section>

    <section class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">3. How We Use Your Data</h2>
        <p>
            Your account information is used strictly for authentication and personalizing your
            experience (e.g., saving searches). We do not sell or share your private account data
            with third parties.
        </p>
    </section>

    <section>
        <h2 class="mb-3 text-xl font-semibold">4. Contact</h2>
        <p>
            For questions regarding your data or to request account deletion, contact: <strong
                >elliehartung@outlook.com</strong
            >
        </p>
    </section>
    <br />
    <Footer />
</div>
