import React from 'react';
import Lottie from 'react-lottie';
import successAnimationData from './Success.json';  // 성공 애니메이션 JSON 파일

const SuccessAnimation = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,  // 애니메이션 자동 재생
    animationData: successAnimationData,  // 성공 애니메이션 JSON 데이터
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return <Lottie options={defaultOptions} height={150} width={150} />;
};

export default SuccessAnimation;
