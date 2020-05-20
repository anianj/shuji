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