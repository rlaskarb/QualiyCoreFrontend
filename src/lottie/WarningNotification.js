import React from 'react';
import Lottie from 'react-lottie';
import warningAnimationData from './Warning.json';  // JSON 애니메이션 파일 가져오기

const WarningAnimation = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,  // 애니메이션 자동 재생
    animationData: warningAnimationData,  // JSON 데이터
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return <Lottie options={defaultOptions} height={150} width={150} />;
};

export default WarningAnimation;