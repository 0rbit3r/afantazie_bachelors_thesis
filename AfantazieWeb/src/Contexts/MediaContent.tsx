import AudioPlayer from "../components/AudioPlayer";

interface MediaContentProps {
    id: number;
}

const CONTENT_FOLDER = import.meta.env.VITE_CONTENT_FOLDER;

export const MediaContent = (props: MediaContentProps) => {
    return (
        <>
            {props.id === 46 && <AudioPlayer path={`${CONTENT_FOLDER}/46.wav`}></AudioPlayer>}
            {props.id === 51 && <img src={`${CONTENT_FOLDER}/GraphSqueezed.jpg`} style={{ maxWidth: "200px" }}></img>}
            {props.id === 55 && <img src={`${CONTENT_FOLDER}/1000_thoughts.png`} style={{ maxWidth: "500px" }}></img>}
            {props.id === 64 && <img src={`${CONTENT_FOLDER}/gephi_cithep.png`} style={{ maxWidth: "500px" }}></img>}
            {props.id === 78 && <video src={`${CONTENT_FOLDER}/data_did_backflip.mp4`} autoPlay={true} controls={true} style={{ maxWidth: "500px" }}></video>}
            {props.id === 80 && <AudioPlayer path={`${CONTENT_FOLDER}/2.wav`}></AudioPlayer>}
        </>
    );
}