import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import styles from './index.module.css';
import Switch from 'react-switch';

interface SubtitleProps {
  content: string[];
  active: boolean;
  translated: string[];
}

const Subtitle: React.FC<SubtitleProps> = ({ content, active, translated }) => {
  const container = useRef<HTMLDivElement>();
  const timer = useRef<number>()
  const [checked, setChecked] = useState<boolean>(true);
  useEffect(() => {
    function autoScroll() {
      timer.current = requestAnimationFrame(() => {
        if (container.current && checked) {
          container.current.scrollTop = container.current.scrollHeight;
        }
        autoScroll()
      })
    };
    autoScroll();
    return () => {
      window.cancelAnimationFrame(timer.current);
    };
  }, [checked]);
  useEffect(() => {
    const containerEl = container.current;
    function scroll() {
      if(containerEl.offsetHeight + containerEl.scrollTop === containerEl.scrollHeight) {
        setChecked(true)
      } else {
        setChecked(false);
      }
    }
    containerEl.addEventListener('scroll', scroll)
    return () => {
      containerEl.removeEventListener('scroll', scroll);
    }
  }, [])
  return (
    <div className={styles.subtitleContainer}>
      <div
        className={classnames(
          styles.subtitle,
          active ? styles.active : styles.inactive,
        )}
        ref={container}
      >
        {content.map((sentence, index) => {
          const sentenceTranslated = translated[index];
          return (
            <div className={styles.sentenceContainer} key={index}>
              <div
                className={styles.original}
                style={{ opacity: content.length - index < 3 ? 1 : 0.5 }}
              >
                {sentence}
              </div>
              <div
                className={styles.translated}
                style={{ opacity: translated.length - index < 2 ? 1 : 0.5 }}
              >
                {sentenceTranslated === 'error'
                  ? '翻译错误'
                  : sentenceTranslated || ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Subtitle;
