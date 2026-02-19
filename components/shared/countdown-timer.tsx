"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetTime: string; // Format: "HH:MM"
  className?: string;
}

export function CountdownTimer({ targetTime, className = "" }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(":").map(Number);
      
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);
      
      // If target time has passed today, assume it's for tomorrow
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      const diff = targetDate.getTime() - now.getTime();
      const oneHourMs = 60 * 60 * 1000;
      
      // Show countdown only if within 1 hour
      if (diff <= oneHourMs && diff > 0) {
        setIsVisible(true);
        setTimeRemaining(diff);
      } else {
        setIsVisible(false);
        setTimeRemaining(null);
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (!isVisible || timeRemaining === null) {
    return null;
  }

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 animate-pulse" />
      <span className="font-mono font-bold text-sm">
        {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
}
