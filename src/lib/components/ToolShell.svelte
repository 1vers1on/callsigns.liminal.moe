<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
    import { m } from '$lib/paraglide/messages.js';
	
	let { children, backText = m.back(), backHref = "javascript:history.back()" } = $props();
</script>

<div class="min-h-screen bg-slate-50">
	<Header />
	<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
		<nav class="mb-8">
			<a
				href={backHref}
				class="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-blue-600"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				{backText}
			</a>
		</nav>
		{@render children()}
	</main>
	<Footer />
</div>
