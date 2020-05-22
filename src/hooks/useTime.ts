import { useState, useEffect, useRef, useCallback } from 'react';

export default function (isRecording: boolean) {
  const [time, setTime] = useState(0);
  const timer = useRef<NodeJS.Timeout>();
  let formattedTime = `${Math.floor(time / 60) < 10 ? 0 : ''}${Math.floor(
    time / 60,
  )}:${time % 60 < 10 ? 0 : ''}${time % 60}`;

  const clear = useCallback(() => {
    setTime(0);
  }, []);

  ;

  useEffect(() => {
    if (isRecording) {
      const call = () => {
        setTime((t) => t + 1);
        timer.current = setTimeout(() => {
          call()
        }, 1000);
      }
      call()
    }
    return () => {
      clearTimeout(timer.current);
    };
  }, [isRecording]);

  return [formattedTime, clear, time];
}
