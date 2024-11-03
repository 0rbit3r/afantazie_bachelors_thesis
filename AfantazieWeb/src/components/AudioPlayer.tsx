function AudioPlayer() {
  return (
    <div>
      <audio controls>
        <source src="/46.wav" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;