import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { downsampleBuffer } from './util';
import { MAIN_STATUS } from '../../common';

function useStackOutPut(transcript: string,status: MAIN_STATUS) {
	const [stack, setStack] = useState<string[]>([]);
	const [output, setOutput] = useState<string[]>([]);

	useEffect(() => {
		const sentence = transcript.replace(/\$[A-Z]+\$/, '');
		if(stack[stack.length - 1] === sentence) return;
		setOutput(stack.concat([sentence]));
		if ( /^\$END\$/.test(transcript)) {
			setStack(stack.concat([sentence]));
		}
	}, [stack, transcript]);
	useEffect(()=>{
		if(status === MAIN_STATUS.IDLE){
			setStack([]);
		}
	},[status])
	return output;
}

export default function useAliyunDirectRecognizer(context: AudioContext, input: MediaStreamAudioSourceNode, status: MAIN_STATUS) {
	const [state, setState] = useState<string>('disconnected');
	const [transcript, setTranscript] = useState<string>('');
	const output = useStackOutPut(transcript,status);

	useEffect(() => {
		if (!context || !input) return;
		if (status === MAIN_STATUS.RECORDING) {
			const recorder = context.createScriptProcessor(512, 1, 1);
			const socket = io('http://anianj.oicp.net:7001/azure', { query: 'userId=anianj', });

			input.connect(recorder);
			recorder.connect(context.destination);

			socket.on('connect_error', (error: string) => {
				setState('error');
			});
			socket.on('disconnect', (error: string) => {
				setState('disconnected');
				setTranscript('');
			});
			socket.on('transcript', (transcript: any) => {
				setState('transcripting');
				setTranscript(transcript);
			});
			socket.on('ready', () => {
				setState('ready');
				recorder.onaudioprocess = evt => {
					socket.emit('data', downsampleBuffer(evt.inputBuffer.getChannelData(0), 16000, 16000));
				}
			})

			return () => {
				input.disconnect(recorder);
				recorder.disconnect(context.destination);
				socket.close();
			}
		}

	}, [context, input, status]);

	return { status: state, content: output };
}