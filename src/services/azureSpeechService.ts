import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION;

export class AzureSpeechService {
    private speechConfig: sdk.SpeechConfig | null = null;
    private activeSynthesizer: sdk.SpeechSynthesizer | null = null;

    constructor() {
        if (!SPEECH_KEY || !SPEECH_REGION) {
            console.warn('Azure Speech Service credentials not configured');
            return;
        }

        try {
            this.speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);

            // Configurar voz en español (México) - Femenina
            this.speechConfig.speechSynthesisVoiceName = 'es-MX-DaliaNeural';

            console.log('Azure Speech Service initialized successfully');
        } catch (error) {
            console.error('Error initializing Azure Speech Service:', error);
            this.speechConfig = null;
        }
    }

    async speak(text: string): Promise<void> {
        if (!this.speechConfig) {
            console.warn('Speech config not initialized');
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                // Detener síntesis anterior si existe
                this.stop();

                // Crear nuevo synthesizer para cada llamada
                const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
                const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig!, audioConfig);
                this.activeSynthesizer = synthesizer;

                synthesizer.speakTextAsync(
                    text,
                    result => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log('✅ Speech synthesis completed successfully');
                            this.activeSynthesizer = null;
                            synthesizer.close();
                            resolve();
                        } else if (result.reason === sdk.ResultReason.Canceled) {
                            const cancellation = sdk.CancellationDetails.fromResult(result);
                            console.error('❌ Speech synthesis canceled:', cancellation.reason);
                            console.error('Error details:', cancellation.errorDetails);
                            this.activeSynthesizer = null;
                            synthesizer.close();
                            reject(new Error(`Speech canceled: ${cancellation.errorDetails}`));
                        } else {
                            console.error('❌ Speech synthesis failed:', result.errorDetails);
                            this.activeSynthesizer = null;
                            synthesizer.close();
                            reject(new Error(result.errorDetails));
                        }
                    },
                    error => {
                        console.error('❌ Speech synthesis error:', error);
                        this.activeSynthesizer = null;
                        synthesizer.close();
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('❌ Error creating synthesizer:', error);
                reject(error);
            }
        });
    }

    stop(): void {
        if (this.activeSynthesizer) {
            try {
                console.log('🛑 Stopping active speech synthesis');
                // Cerrar inmediatamente el synthesizer
                this.activeSynthesizer.close();
                this.activeSynthesizer = null;
            } catch (error) {
                console.error('Error stopping speech:', error);
                this.activeSynthesizer = null;
            }
        } else {
            console.log('⚠️ No active synthesizer to stop');
        }
    }

    async speakSSML(ssml: string): Promise<void> {
        if (!this.speechConfig) {
            console.warn('Speech config not initialized');
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
                const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig!, audioConfig);

                synthesizer.speakSsmlAsync(
                    ssml,
                    result => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            console.log('✅ SSML speech synthesis completed');
                            synthesizer.close();
                            resolve();
                        } else {
                            console.error('❌ SSML speech synthesis failed:', result.errorDetails);
                            synthesizer.close();
                            reject(new Error(result.errorDetails));
                        }
                    },
                    error => {
                        console.error('❌ SSML speech synthesis error:', error);
                        synthesizer.close();
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('❌ Error creating SSML synthesizer:', error);
                reject(error);
            }
        });
    }
}

export const azureSpeechService = new AzureSpeechService();
