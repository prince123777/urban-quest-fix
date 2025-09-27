import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Upload,
  Loader2,
  Volume2,
  FileAudio
} from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (transcription: string, audioUrl?: string) => void;
  maxDurationSeconds?: number;
  className?: string;
}

const VoiceRecorder = ({ 
  onRecordingComplete, 
  maxDurationSeconds = 300, // 5 minutes
  className = '' 
}: VoiceRecorderProps) => {
  const { toast } = useToast();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSeconds) {
            stopRecording();
            toast({
              title: 'Maximum recording time reached',
              description: `Recording stopped at ${maxDurationSeconds} seconds`,
            });
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setRecordingTime(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsArrayBuffer(audioBlob);
      
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64Audio = btoa(String.fromCharCode(...uint8Array));
        
        // Call edge function for transcription
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });
        
        if (error) {
          throw error;
        }
        
        const transcribedText = data.text || '';
        setTranscription(transcribedText);
        
        // Upload audio file if transcription successful
        let uploadedAudioUrl = '';
        if (transcribedText) {
          try {
            const timestamp = Date.now();
            const fileName = `voice-${timestamp}.webm`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('issue-documents')
              .upload(`voice-recordings/${fileName}`, audioBlob, {
                contentType: 'audio/webm',
                cacheControl: '3600'
              });
            
            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('issue-documents')
                .getPublicUrl(uploadData.path);
              
              uploadedAudioUrl = urlData.publicUrl;
            }
          } catch (uploadError) {
            console.warn('Could not upload audio file:', uploadError);
          }
        }
        
        onRecordingComplete(transcribedText, uploadedAudioUrl);
        
        toast({
          title: 'Transcription Complete',
          description: transcribedText ? 'Voice successfully converted to text' : 'No speech detected',
        });
      };
      
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Error',
        description: 'Failed to convert voice to text. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-center gap-2">
            <FileAudio className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Voice Recording</h3>
          </div>
          
          {/* Timer */}
          <div className="text-2xl font-mono font-bold">
            {formatTime(recordingTime)}
            {recordingTime > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                / {formatTime(maxDurationSeconds)}
              </span>
            )}
          </div>
          
          {/* Recording Indicator */}
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              Recording...
            </Badge>
          )}
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isRecording && !audioUrl && (
              <Button size="lg" onClick={startRecording} className="gap-2">
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <Button size="lg" variant="destructive" onClick={stopRecording} className="gap-2">
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
            
            {audioUrl && (
              <>
                <Button 
                  variant="outline" 
                  onClick={playRecording}
                  disabled={isTranscribing}
                  className="gap-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={deleteRecording}
                  disabled={isTranscribing}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                
                <Button 
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  className="gap-2"
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </Button>
              </>
            )}
          </div>
          
          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
          
          {/* Transcription Display */}
          {transcription && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Transcription:</span>
                </div>
                <p className="text-sm text-left bg-muted p-3 rounded">
                  {transcription}
                </p>
              </CardContent>
            </Card>
          )}
          
          <p className="text-xs text-muted-foreground">
            Speak clearly for best results. Maximum recording time: {formatTime(maxDurationSeconds)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;