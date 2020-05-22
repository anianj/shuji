import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { downSampleBuffer } from './util';
import { MAIN_STATUS } from '../../common';
import translate from '../../service/translate';

function useStackOutPut(transcript: string, status: MAIN_STATUS) {
  const sentence = transcript.replace(/\$[A-Z]+\$/, '');
  const [outputStack, setOutputStack] = useState<string[]>([]);
  const [outputTranslated, setOutputTranslatedStack] = useState<string[]>([]);
  const isEndSentence = /^\$END\$/.test(transcript);
  useEffect(() => {
    if (
      isEndSentence &&
      sentence !== 'undefined' &&
      outputStack[outputStack.length - 1] !== sentence
    ) {
      setOutputStack((old) => old.concat(sentence));
      translate(sentence).then((result) => {
        setOutputTranslatedStack((translated) => translated.concat(result));
      }).catch(() => {
        setOutputTranslatedStack((translated) => translated.concat('error'))
      });
    }
  }, [isEndSentence, outputStack, sentence, transcript]);
  return {
    original: outputStack.concat(
      isEndSentence || sentence === 'undefined' ? '' : sentence,
    ),
    translated: outputTranslated,
  };
}

export default function useAliyunDirectRecognizer(
  context: AudioContext,
  input: MediaStreamAudioSourceNode,
  status: MAIN_STATUS,
) {
  const [state, setState] = useState<string>('disconnected');
  const [transcript, setTranscript] = useState<string>('');
  const output = useStackOutPut(transcript, status);

  useEffect(() => {
    if (!context || !input) return;
    if (status === MAIN_STATUS.RECORDING) {
      const recorder = context.createScriptProcessor(512, 1, 1);
      const socket = io('http://anianj.oicp.net:7001/azure', {
        query: 'userId=anianj',
      });

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
        setState('transcript');
        setTranscript(transcript);
      });
      socket.on('ready', () => {
        setState('ready');
        recorder.onaudioprocess = (evt) => {
          socket.emit(
            'data',
            downSampleBuffer(evt.inputBuffer.getChannelData(0), 16000, 16000),
          );
        };
      });

      return () => {
        input.disconnect(recorder);
        recorder.disconnect(context.destination);
        socket.close();
      };
    }
  }, [context, input, status]);

  return {
    status: state,
    content: output.original,
    translated: output.translated,
  };
}
