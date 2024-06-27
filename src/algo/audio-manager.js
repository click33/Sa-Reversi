
import downChessAudio from '../assets/audio/down-chess.wav';

export default {
    playDownChess: function ({ error }) {
        var audio = new Audio(downChessAudio)
        audio.play().catch(error);
    }
}
