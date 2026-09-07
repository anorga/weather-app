import { useId } from "react";
import { condition } from "../services/WeatherService";

export default function Landscape({
  night,
  code,
}: {
  night: boolean;
  code: number;
}) {
  const kind = condition(code).kind;
  const id = useId().replace(/:/g, "");
  const skyId = `${id}-sky`,
    hillId = `${id}-hill`;
  const wet = kind === "rain" || kind === "storm";
  const muted = wet || kind === "fog" || kind === "snow" || code === 3;
  const snowy = kind === "snow";
  const sky = night
    ? ["#263c49", "#687e80"]
    : muted
      ? ["#8caaa9", "#d3ddd4"]
      : ["#dce4d6", "#f4eed7"];
  return (
    <svg
      className={`landscape scene-${kind}`}
      data-scene={`${kind}-${night ? "night" : "day"}`}
      viewBox="0 0 640 440"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={skyId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id={hillId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop stopColor={snowy ? "#b5c8c1" : "#728878"} />
          <stop offset="1" stopColor={snowy ? "#879f98" : "#486455"} />
        </linearGradient>
      </defs>
      <path fill={`url(#${skyId})`} d="M0 0h640v440H0z" />
      {!muted && (
        <circle
          className="scene-orb"
          cx="440"
          cy="130"
          r="42"
          fill={night ? "#e9eadc" : "#fbf2c4"}
        />
      )}
      {night && kind === "sun" && (
        <g fill="#e2e8df" opacity=".65">
          <circle cx="260" cy="74" r="1.5" />
          <circle cx="345" cy="98" r="2" />
          <circle cx="560" cy="68" r="1.5" />
          <circle cx="515" cy="204" r="1.5" />
        </g>
      )}
      {kind !== "sun" && kind !== "fog" && (
        <g
          className="scene-clouds"
          fill={night ? "#657b80" : wet ? "#718e93" : "#e2e7df"}
          opacity=".9"
        >
          <path d="M220 163q-18-24 8-35q5-32 36-22q18-26 42-6q29-3 31 23q30-4 38 21q4 19-18 19Z" />
          <path d="M384 206q-20-24 8-37q8-31 33-21q21-32 50-7q32-7 42 24q34-1 34 24q0 17-22 17Z" />
        </g>
      )}
      <path
        d="M0 272Q90 156 190 237T375 222T640 225V440H0Z"
        fill={snowy ? "#e0e9e2" : "#bbc7ad"}
      />
      <path
        d="M0 302Q125 205 264 284T480 253T640 286V440H0Z"
        fill={snowy ? "#c9d8cf" : "#93a88e"}
      />
      <path
        d="M0 365Q158 238 331 325T640 304V440H0Z"
        fill={`url(#${hillId})`}
      />
      <path
        d="M0 402Q162 365 280 401T640 365V440H0Z"
        fill={snowy ? "#6f8c80" : "#365544"}
      />
      <path
        d="M357 440Q430 405 383 375T343 341Q330 327 355 321"
        fill="none"
        stroke="#d5d7b4"
        strokeWidth="8"
        opacity=".55"
      />
      {kind === "sun" && !night && (
        <g
          fill="none"
          stroke={night ? "#d4ddd5" : "#61796b"}
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M325 128q7-6 14 0q7-6 14 0m-75 37q5-4 10 0q5-4 10 0" />
        </g>
      )}
      {wet && (
        <g
          className="scene-rain"
          stroke="#d4e1df"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".65"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <path
              key={i}
              d={`M${190 + ((i * 53) % 410)} ${185 + ((i * 37) % 180)}l-7 16`}
            />
          ))}
        </g>
      )}
      {snowy && (
        <g fill="#f1f6f0" opacity=".9">
          {Array.from({ length: 30 }, (_, i) => (
            <circle
              key={i}
              cx={180 + ((i * 67) % 445)}
              cy={140 + ((i * 41) % 235)}
              r={(i % 3) + 1.5}
            />
          ))}
        </g>
      )}
      {kind === "fog" && (
        <g
          fill="none"
          stroke="#e3e9df"
          strokeWidth="18"
          strokeLinecap="round"
          opacity=".45"
        >
          <path d="M160 172h360m-250 60h340m-420 65h320m-230 49h330" />
        </g>
      )}
      {kind === "storm" && (
        <path
          d="m428 210-19 43h19l-9 35 39-52h-22l15-26Z"
          fill="#e4d7a2"
          opacity=".8"
        />
      )}
    </svg>
  );
}
