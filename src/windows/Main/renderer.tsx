import { remote } from 'electron';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { MAIN_STATUS } from '../../common';
import useUserMedia from '../../hooks/inputs/useUserMedia';
import useAzureRecgnier from '../../hooks/outputs/useAzureRecgnier';
import AudioWaveViz from '../../components/AduioWaveViz';
import Subtitle from '../../components/Subtitle';

import styles from './index.module.css';

const Main: React.FC<{}> = () => {
  const [status, setStatus] = useState(MAIN_STATUS.INIT);
  const [active, setActive] = useState(true);
  const [time, setTime] = useState(0);
  const timer = useRef<NodeJS.Timeout>();
  const activeTimer = useRef<NodeJS.Timeout>();

  const audioCtx = useMemo(() => new AudioContext({ sampleRate: 16000 }), []);
  const input = useUserMedia(audioCtx);
  const output = useAzureRecgnier(audioCtx, input, status);
  useEffect(() => {
    switch (status) {
      case MAIN_STATUS.RECORDING:
        timer.current = setTimeout(() => {
          setTime(time + 1);
        }, 1000);        
        break;
      default:
        window.clearTimeout(timer.current);
        break;
    }
  }, [status, time])

  const handleMicrophone = useCallback(() => {
    switch (status) {
      case MAIN_STATUS.RECORDING:
        setStatus(MAIN_STATUS.IDLE);
        break;

      default:
        setStatus(MAIN_STATUS.RECORDING);
        break;
    }
  }, [status, output])

  // useEffect(()=>{
  //   remote.getCurrentWindow().setIgnoreMouseEvents(!active, { forward: !active })
  // },[active])

  const handleEnter = useCallback(() => {
    // window.clearTimeout(activeTimer.current);
    // activeTimer.current = setTimeout(() => {
    //   setActive(true);
    // }, 30000);
  }, [activeTimer.current]);

  const handleLeave = useCallback(() => {
    window.clearTimeout(activeTimer.current);
    activeTimer.current = setTimeout(() => {
      setActive(false);
    }, 1500)
  }, []);

  const handleClose = useCallback(() => {
    remote.getCurrentWindow().close();
  }, []);
  
  return (
    <div className={styles.main} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {output && output.status === 'transcripting' && <Subtitle content={output.content} active={active} />}
      <div className={classnames(styles.close, active ? styles.active : styles.deactive)} onClick={handleClose} onMouseOver={evt => setActive(true)}></div>
      <div className={classnames(styles.bottom, active ? styles.active : styles.deactive)}>
        {status === MAIN_STATUS.RECORDING && active && <div className={styles.audioViz}><AudioWaveViz context={audioCtx} input={input} /></div>}
        <div className={styles.info}>
          {<div className={styles.time}>{`${Math.floor(time / 60) < 10 ? 0 : ''}${Math.floor(time / 60)} :${time % 60 < 10 ? 0 : ''}${time % 60}`}</div>}
          {output && <div className={classnames(styles.networkStatus,styles[output.status])}></div>}
        </div>
        <div className={styles.bar}>
          <div className={styles.barLeft}></div>
          <div className={styles.barRight}></div>
        </div>
        <div className={styles.microphone} onClick={handleMicrophone} onMouseOver={() => setActive(true)}></div>
      </div>
    </div>
  )
}

ReactDOM.render(<Main />, document.getElementById('app'));