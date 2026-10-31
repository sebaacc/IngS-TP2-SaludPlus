import { useEffect, useState } from "react";
import Icon from "./Icon";
import { formatLocalTime } from "../utils/queue";

export default function LocalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="clock-block"
      aria-label={`Hora local ${formatLocalTime(now)}`}
    >
      <Icon name="clock" size={22} />
      <div>
        <strong>
          {formatLocalTime(now)}
        </strong>
        <span>
          {now.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
