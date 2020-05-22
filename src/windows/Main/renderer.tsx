import { remote } from 'electron';
import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { MAIN_STATUS } from '../../common';
import useUserMedia from '../../hooks/inputs/useUserMedia';
import useAzureRecognizer from '../../hooks/outputs/useAzureRecognizer';
import AudioWaveViz from '../../components/AduioWaveViz';
import Subtitle from '../../components/Subtitle';
import useTime from '../../hooks/useTime';

import styles from './index.module.css';

const Main: React.FC<{}> = () => {
  const [status, setStatus] = useState(MAIN_STATUS.INIT);
  const [active, setActive] = useState(true);
  const activeTimer = useRef<NodeJS.Timeout>();

  const [showTime] = useTime(status === MAIN_STATUS.RECORDING);

  const audioCtx = useMemo(() => new AudioContext({ sampleRate: 16000 }), []);
  const input = useUserMedia(audioCtx);
  const output = useAzureRecognizer(audioCtx, input, status);

  const handleMicrophone = useCallback(() => {
    switch (status) {
      case MAIN_STATUS.RECORDING:
        setStatus(MAIN_STATUS.IDLE);
        break;

      default:
        setStatus(MAIN_STATUS.RECORDING);
        break;
    }
  }, [status]);

  // useEffect(()=>{
  //   remote.getCurrentWindow().setIgnoreMouseEvents(!active, { forward: !active })
  // },[active])

  const handleEnter = useCallback(() => {
    // window.clearTimeout(activeTimer.current);
    // activeTimer.current = setTimeout(() => {
    //   setActive(true);
    // }, 30000);
  }, []);

  const handleLeave = useCallback(() => {
    window.clearTimeout(activeTimer.current);
    activeTimer.current = setTimeout(() => {
      setActive(false);
    }, 1500);
  }, []);

  const handleClose = useCallback(() => {
    remote.getCurrentWindow().close();
  }, []);

  const activeClass = active ? styles.active : styles.inactive;
  return (
    <div
      className={styles.main}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {(
        <Subtitle content={output.content} translated={output.translated} active={active} />
      )}
      <div
        className={classnames(styles.close, activeClass)}
        onClick={handleClose}
        onMouseOver={(evt) => setActive(true)}
      ></div>
      <div className={classnames(styles.bottom, activeClass)}>
        {status === MAIN_STATUS.RECORDING && active && (
          <div className={styles.audioViz}>
            <AudioWaveViz context={audioCtx} input={input} />
          </div>
        )}
        <div className={styles.info}>
          {<div className={styles.time}>{showTime}</div>}
          {output && (
            <div
              className={classnames(
                styles.networkStatus,
                styles[output.status],
              )}
            ></div>
          )}
        </div>
        <div className={styles.bar}>
          <div className={styles.barLeft}></div>
          <div className={styles.barRight}></div>
        </div>
        <div
          className={styles.microphone}
          onClick={handleMicrophone}
          onMouseOver={() => setActive(true)}
        ></div>
      </div>
    </div>
  );
};

ReactDOM.render(<Main />, document.getElementById('app'));
