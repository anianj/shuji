import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { downsampleBuffer } from './util';
import { MAIN_STATUS } from '../../common';

interface TranscriptResult {
	header:{
		namespace:string;
		name:string
	};
	payload:{
		index: number;
		time: number;
		begin_time: number;
		result: string;
		confidence: number;
	}
}

export default function useAliyunRecognizer(context: AudioContext, input: MediaStreamAudioSourceNode, status: MAIN_STATUS) {
	const [state,setState] = useState<string>('disconnected');
	const [result,setResult] = useState<string>();
	useEffect(() => {
		if (!context || !input) return;
		if (status === MAIN_STATUS.RECORDING) {
			const recorder = context.createScriptProcessor(8192, 1, 1);
			const socket = io('http://47.108.50.109:7001/aliyun', { query: 'userId=anianj', });

			input.connect(recorder);
			recorder.connect(context.destination);

			socket.on('connect_error', (error: string) => {
				setState( 'error');
			});
			socket.on('disconnect', (error: string) => {
				setState('disconnected');
				setResult('');
			});
			socket.on('transcript', (transcript: string) => {
				setState('transcripting');
				const result = transcript.match(/"result":"(.*?)"/);
				if(result) setResult(result[1]);
			});
			socket.on('ready', () => {
				setState('ready');
				recorder.onaudioprocess = evt => {
					socket.emit('data',downsampleBuffer(evt.inputBuffer.getChannelData(0), 16000, 16000));
				}
			})

			return () => {
				input.disconnect(recorder);
				recorder.disconnect(context.destination);
				socket.close();
			}
		}

	}, [context, input,status]);
	return {status:state,content:result};
}