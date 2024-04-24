import React, { useState } from 'react';

import "../../styles/home.css";


const CustomVideoPlayer = ({ videoSrc }) => {
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlayClick = () => {
    const video = document.getElementById('myVideo');
    video.play();
    setShowPlayButton(false);
  };

  const handleVideoEnded = () => {
    setShowPlayButton(true);
  };

  return (
    <div className="video-container">
      <video id="myVideo" width="320" height="240" muted className="play-now" data-fancybox="gallery" data-caption="" onEnded={handleVideoEnded}>
        <source src={videoSrc} type="video/mp4" />
      </video>
      {showPlayButton && (
        <>
        <i id="playButton" className="custom-play-button fas fa-play" onClick={handlePlayClick}>
         
        </i>
        
        </>
      )}
    </div>
  );
};

export default CustomVideoPlayer;

