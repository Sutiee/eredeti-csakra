"use client";

/**
 * AudioPlayer Component
 * Custom HTML5 audio player for meditation playback
 * Features: Play/Pause, Seek, Progress bar, Time display
 */

import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  chakraColor: string;
  title?: string;
}

export default function AudioPlayer({ src, chakraColor, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle play/pause toggle
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Nem sikerült lejátszani az audiót');
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle error
  const handleError = () => {
    setError('Hiba történt az audio betöltése során');
    setIsLoading(false);
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Player controls */}
      <div className="flex items-center gap-4 mb-4">
        {/* Skip backward button */}
        <button
          onClick={() => skip(-15)}
          disabled={isLoading}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="15 másodperc vissza"
          title="15 másodperc vissza"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: chakraColor }}
          aria-label={isPlaying ? 'Szüneteltetés' : 'Lejátszás'}
        >
          {isLoading ? (
            <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip forward button */}
        <button
          onClick={() => skip(15)}
          disabled={isLoading}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="15 másodperc előre"
          title="15 másodperc előre"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>

        {/* Time display */}
        <div className="ml-auto text-sm text-gray-600 font-mono min-w-[100px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={isLoading}
          className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, ${chakraColor} 0%, ${chakraColor} ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
          }}
          aria-label="Időzítő"
        />

        {/* Progress indicator */}
        <div
          className="absolute top-0 left-0 h-2 rounded-l-full pointer-events-none transition-all"
          style={{
            width: `${(currentTime / duration) * 100}%`,
            backgroundColor: chakraColor,
            opacity: 0.8
          }}
        />
      </div>

      {/* Meditation title (optional) */}
      {title && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {title}
        </div>
      )}
    </div>
  );
}

/**
 * Format seconds to MM:SS format
 */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
