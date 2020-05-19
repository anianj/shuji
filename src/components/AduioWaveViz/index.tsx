import React, { useRef, useEffect, useMemo, useState } from 'react';
import styles from './index.module.css';
interface AudioWaveVizProps {
  context: AudioContext;
  input: MediaStreamAudioSourceNode;
}


const AudioWaveViz: React.FC<AudioWaveVizProps> = ({ context, input }) => {
  const canvas = useRef<HTMLCanvasElement>();
  const [WIDTH,setWIDTH] = useState(window.innerWidth / 2 - 25);
  const HEIGHT = 30;

  useEffect(()=>{
    window.addEventListener('resize', () => {
      setWIDTH(window.innerWidth / 2 - 25);
    })
  },[])

  useEffect(() => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext('2d');
    const analyser = context.createAnalyser();
    let nextFrameAnimationId:number;
    input.connect(analyser);

    const drawCurve = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(200,200,200,0.6)';
      ctx.beginPath();
      ctx.moveTo(0, HEIGHT / 2);
      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();

      const bufferLength = analyser.fftSize;
      const sliceWidth = WIDTH / bufferLength;
      const dataArray = new Uint8Array(bufferLength);

      analyser.getByteTimeDomainData(dataArray);
      let x = 0;
      ctx.moveTo(x, HEIGHT / 2);
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * HEIGHT / 2;
        ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();

      nextFrameAnimationId = window.requestAnimationFrame(drawCurve);
    };

    drawCurve();

    return () => {
      input.disconnect(analyser);
      window.cancelAnimationFrame(nextFrameAnimationId);
    }
  }, [canvas.current, context, input]);

  return (
    <div className={styles.viz}>
      <canvas ref={canvas} width={WIDTH} height="30"></canvas>
    </div>
  )
}

export default AudioWaveViz;