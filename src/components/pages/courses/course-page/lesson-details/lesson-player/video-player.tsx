import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

type VideoPlayerProps = {
  videoId: string;
  autoplay: boolean;
};

const VideoPlayer = ({ videoId, autoplay }: VideoPlayerProps) => {
  const userAlreadyInteracted =
    typeof navigator !== "undefined" &&
    navigator.userActivation?.hasBeenActive === true;

  return (
    <MediaPlayer
      title="Vídeo da aula"
      src={`youtube/${videoId}`}
      autoplay={autoplay && userAlreadyInteracted}
    >
      <MediaProvider />
      <PlyrLayout icons={plyrLayoutIcons} />
    </MediaPlayer>
  );
};

export default VideoPlayer;
