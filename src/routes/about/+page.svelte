<script lang="ts">
    import Header from '$lib/components/header.svelte';
    import Footer from '$lib/components/footer.svelte';
</script>

<div class="min-h-screen bg-slate-50">
    <Header />

    <main class="mx-auto max-w-3xl px-4 py-12 text-slate-800">
        <h1 class="mb-4 text-3xl font-bold">About HamLookup</h1>

        <p class="mb-4">
            HamLookup is a community-focused service for discovering amateur radio operators and
            license information. Our goal is to make public licensing data easy to search and useful
            tools accessible for operators of all levels.
        </p>

        <h2 class="mt-6 mb-2 text-xl font-semibold">Data & Updates</h2>
        <p class="mb-4">
            The database is compiled from public government sources (e.g., FCC ULS) and other
            authoritative datasets. The database is updated weekly to keep records current.
        </p>

        <h2 class="mt-6 mb-2 text-xl font-semibold">Privacy & Terms</h2>
        <p class="mb-4">
            We respect user privacy. For details, see our <a href="/privacy" class="text-blue-600"
                >Privacy Policy</a
            >
            and <a href="/terms" class="text-blue-600">Terms of Service</a>.
        </p>

        <h2 class="mt-6 mb-2 text-xl font-semibold">Credits</h2>
        <p class="mb-4">
            Thanks to contributors and data providers. See full credits <a
                href="/credits"
                class="text-blue-600">here</a
            >.
        </p>

        <h2 class="mt-6 mb-2 text-xl font-semibold">Contact</h2>
        <p>
            For questions or data concerns contact: <strong>elliehartung@outlook.com</strong>
        </p>
    </main>

    <Footer />
</div>
