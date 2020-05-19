import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import styles from './index.module.css';

interface SubtitleProps{
  content: string[];
  active: boolean;
}

const Subtitle:React.FC<SubtitleProps> = ({content,active}) => {
  const container = useRef<HTMLDivElement>();
  useEffect(() => {
    const cancelHandle = setInterval(()=>{
      if(container.current){
        container.current.scrollTop = container.current.scrollHeight;
      }
    },1000);
    return () => {
      window.clearInterval(cancelHandle);
    }
  },[])
  return (
    <div 
      className={classnames(styles.subtitle,active ? styles.active : styles.deactive)} 
      ref={container}
    >
      {content.map(
        (sentence,idx) =>
      <span className={styles.sentence} key={idx} style={{opacity:  content.length - idx < 3 ? 1 : 0.5}}>{sentence}</span>
      )}
    </div>
  )
}
export default Subtitle;