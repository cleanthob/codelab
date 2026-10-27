import { useRef } from "react";

import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";

import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
} from "@vidstack/react";

import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

type VideoPlayerProps = {
  videoId: string;
  autoplay: boolean;
};

const VideoPlayer = ({ videoId, autoplay }: VideoPlayerProps) => {
  const player = useRef<MediaPlayerInstance>(null);
  const started = useRef(false);

  const handleCanPlay = async () => {
    if (!autoplay || started.current) return;

    started.current = true;

    try {
      await player.current?.play();
    } catch (error) {
      started.current = false;
      console.error("Não foi possível iniciar o vídeo:", error);
    }
  };

  return (
    <MediaPlayer
      ref={player}
      title="Vídeo da aula"
      src={`youtube/${videoId}`}
      autoPlay={false}
      muted={autoplay}
      onCanPlay={handleCanPlay}
    >
      <MediaProvider />
      <PlyrLayout icons={plyrLayoutIcons} />
    </MediaPlayer>
  );
};

export default VideoPlayer;
