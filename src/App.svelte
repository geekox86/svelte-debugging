<script lang="ts">
	import produce from 'immer'

	let x = []

	setInterval(() => {
		x = produce(x, (x) => { x.push(x.length + 1) })
	}, 1000)
</script>

<template lang="pug">
	div
		| {x[x.length - 1]}
</template>
