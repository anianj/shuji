import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import styles from './index.module.css';

interface SubtitleProps {
  content: string[];
  active: boolean;
  translated: string[];
}

const Subtitle: React.FC<SubtitleProps> = ({ content, active, translated }) => {
  const container = useRef<HTMLDivElement>();
  const heights = useRef<Array<number>>([]);
  useEffect(() => {
    const cancelHandle = setInterval(() => {
      if (container.current) {
        container.current.scrollTop = container.current.scrollHeight;
      }
    }, 1000);
    return () => {
      window.clearInterval(cancelHandle);
    };
  }, []);
  useEffect(() => {
    const originalSentenceContainer = container.current.querySelector(
      `.original-sentence${content.length - 2}`,
    );
    if (originalSentenceContainer) {
      const { height } = originalSentenceContainer.getBoundingClientRect();
      heights.current.push(height);
    }
  }, [content.length]);
  return (
    <div
      className={classnames(
        styles.subtitle,
        active ? styles.active : styles.inactive,
      )}
      ref={container}
    >
      <div className={styles.original}>
        {content.map((sentence, idx) => (
          <span
            className={classnames(styles.sentence, 'original-sentence' + idx)}
            key={idx}
            style={{ opacity: content.length - idx < 3 ? 1 : 0.5 }}
          >
            {sentence}
          </span>
        ))}
      </div>
      <div className={styles.translated}>
        {translated.map((sentenceTranslated, idx) => (
          <span
            className={styles.sentence}
            key={idx}
            style={{ opacity: translated.length - idx < 2 ? 1 : 0.5, height: heights.current[idx] || 'auto' }}
          >
            {sentenceTranslated === 'error' ? '翻译错误' : sentenceTranslated}
          </span>
        ))}
      </div>
    </div>
  );
};
export default Subtitle;
