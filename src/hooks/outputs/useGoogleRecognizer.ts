import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { MAIN_STATUS } from '../../common';

function downsampleBuffer(buffer: Float32Array, sampleRate: number, outSampleRate: number) {
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

export default function useGoogleRecognizer(context: AudioContext, input: MediaStreamAudioSourceNode, status: MAIN_STATUS) {
	const [output, setOutput] = useState<{status:string,content:string}>();
	useEffect(() => {
		if (!context || !input) return;
		let recorder: ScriptProcessorNode, socket: SocketIOClient.Socket;

		if (status === MAIN_STATUS.RECORDING) {
			recorder = context.createScriptProcessor(2048, 1, 1);
			
			socket = io('http://47.56.89.112:7001/google', { query: 'userId=anianj', });
			socket.on('connect_error', (error:string) => {
				setOutput({
					status:'error',
					content:error
				});
			});
			socket.on('connect', (error:string) => {
				setOutput({
					status:'connect',
					content:''
				});
			});
			socket.on('disconnect', (error:string) => {
				setOutput({
					status:'disconnect',
					content:''
				});
			});
			socket.on('transcript', (transcript:string) => {
				console.log(transcript);
					setOutput({
						status:'transcript',
						content:transcript
					});
			});

			input.connect(recorder);
			recorder.connect(context.destination);
			recorder.onaudioprocess = evt => {
				socket.emit(
					'data',
					{
						userId: 'anianj',
						buffer: downsampleBuffer(evt.inputBuffer.getChannelData(0), 16000, 16000)
					}
				);
			}

			return () => {
				input.disconnect(recorder);
				recorder.disconnect(context.destination);
				socket.close();
			}
		}

	}, [context, input, status,setOutput]);
	return output;
}