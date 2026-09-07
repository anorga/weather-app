import {
  Sun,
  CloudSun,
  CloudMoon,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  Moon,
} from "lucide-react";
import { condition } from "../services/WeatherService";
export default function WeatherIcon({
  code,
  day = true,
  size = 28,
}: {
  code: number;
  day?: boolean;
  size?: number;
}) {
  const kind = condition(code).kind;
  const Icon = {
    sun: day ? Sun : Moon,
    cloud: day ? CloudSun : CloudMoon,
    rain: CloudRain,
    snow: Snowflake,
    storm: CloudLightning,
    fog: CloudFog,
  }[kind];
  return (
    <Icon
      className={`weather-icon ${kind}`}
      size={size}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}
