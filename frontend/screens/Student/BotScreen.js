import {Audio} from 'expo-av';

const BotScreen = () =>{
    const [recording, setRecording] = useState(null);
    const [sound, setSound] = useState(null);

    async function startRecording(){
        try {
            const {status} = await Audio.requestPermissionsAsync();
            if(status === 'granted'){
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const recording = new Audio.Recording();
                await recording.prepareToRecordAsync(
                    Audio.RECORDING_OPTIONS_PRESETNT_HIGH_QUALITY
                );
                await recording.startAsync();
                setRecording(recording);
                console.log('Recording started');
            }
        } catch (error) {
            console.error('Error starting recording', error);
        }
    }
    async function stopRecording() {
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            const response = await processVoiceInput(uri);
            playResponse(response.audioUrl);
        } catch (error) {
            console.error('Error stopping recording', error);
        }
    }
    }