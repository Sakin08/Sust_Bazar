import { useEffect, useState } from 'react';

function Countdown({ eventDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(eventDate) - new Date();
      if (diff <= 0) return setTimeLeft({ ended: true });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (timeLeft.ended) return <span>Event Started</span>;

  return (
    <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
  );
}

export default Countdown;
