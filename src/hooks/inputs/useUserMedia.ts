import React, { useEffect, useState } from 'react';
import { desktopCapturer } from 'electron';

function useUserMedia(context: AudioContext) {
  const [source, setSource] = useState<MediaStreamAudioSourceNode>();

  useEffect(() => {
    desktopCapturer.getSources({ types: ['screen'] })
      .then((sources: Electron.DesktopCapturerSource[]) => {
        for (let i = 0; i < sources.length; ++i) {
          if (sources[i].name.indexOf('Screen') > -1) {
            navigator.mediaDevices.enumerateDevices()
              .then(devices => {
                const loopbackDevice = devices.find(device => device.label === 'Loopback Audio (Virtual)' && device.kind === "audiooutput");
                return navigator.mediaDevices.getUserMedia({
                  audio: {
                    deviceId: { exact: loopbackDevice.deviceId }
                  }
                })
              })
              .then((stream) => {
                const sourceNode = context.createMediaStreamSource(stream);
                // const loudnessAnalyzerNode = context.createAnalyser();
                // setInterval(() => {
                //   const array = new Uint8Array(loudnessAnalyzerNode.fftSize);
                //   loudnessAnalyzerNode.getByteTimeDomainData(array);
                //   let total = 0;
                //   let max = 0;
                //   for (let i in array) {
                //     array[i] = Math.abs(array[i] - 128);
                //     total += array[i];
                //     max = Math.max(max, array[i]);
                //   }
                //   console.log(max,total /array.length);
                // }, 2000);
                // sourceNode.connect(loudnessAnalyzerNode);
                setSource(sourceNode);
              })
              .catch((e) => {
                console.log(e);
              })
          }
        }
      });
  }, [context]);

  return source;
}

export default useUserMedia;