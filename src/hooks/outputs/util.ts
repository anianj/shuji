export function downSampleBuffer(buffer: Float32Array, sampleRate: number, outSampleRate: number) {
	const sampleRateRatio = sampleRate / outSampleRate;
	const result = new Int16Array(Math.round(buffer.length / sampleRateRatio));
	let offsetResult = 0;
	let offsetBuffer = 0;
	while (offsetResult < result.length) {
		const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
		let accum = 0, count = 0;
		for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
			accum += buffer[i];
			count++;
		}
		result[offsetResult] = Math.min(1, accum / count) * 0x7FFF;
		offsetResult++;
		offsetBuffer = nextOffsetBuffer;
	}
	return result.buffer;
}

