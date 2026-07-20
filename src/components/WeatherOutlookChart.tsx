type OutlookPoint = {
  day: string;
  rainMm: number;
  temp: number;
  safe: boolean;
};

type Props = {
  data: OutlookPoint[];
  ariaLabel: string;
  rainLabel: string;
};

const WIDTH = 700;
const HEIGHT = 150;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 122;
const PLOT_LEFT = 24;
const PLOT_RIGHT = 676;

export default function WeatherOutlookChart({ data, ariaLabel, rainLabel }: Props) {
  const maxRain = Math.max(1, ...data.map((point) => point.rainMm));
  const minTemp = Math.min(...data.map((point) => point.temp));
  const maxTemp = Math.max(...data.map((point) => point.temp));
  const tempRange = Math.max(1, maxTemp - minTemp);
  const step = data.length > 1 ? (PLOT_RIGHT - PLOT_LEFT) / (data.length - 1) : 0;
  const xAt = (index: number) => PLOT_LEFT + step * index;
  const tempY = (value: number) => PLOT_BOTTOM - 18 - ((value - minTemp) / tempRange) * 66;
  const linePoints = data.map((point, index) => xAt(index) + ',' + tempY(point.temp)).join(' ');
  const areaPoints = PLOT_LEFT + ',' + PLOT_BOTTOM + ' ' + linePoints + ' ' + PLOT_RIGHT + ',' + PLOT_BOTTOM;

  return (
    <svg className="ops-chart-svg" viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT} role="img" aria-label={ariaLabel} preserveAspectRatio="xMidYMid meet">
      {[0, 1, 2, 3].map((line) => {
        const y = PLOT_TOP + line * ((PLOT_BOTTOM - PLOT_TOP) / 3);
        return <line key={line} className="ops-chart-grid" x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} />;
      })}
      <polygon className="ops-chart-area" points={areaPoints} />
      {data.map((point, index) => {
        const x = xAt(index);
        const rainHeight = Math.max(3, (point.rainMm / maxRain) * 78);
        return (
          <g key={point.day + index}>
            <title>{point.day + ' - ' + rainLabel + ': ' + point.rainMm + ' mm, ' + point.temp + ' C'}</title>
            <rect
              className={point.safe ? 'ops-chart-bar ops-chart-bar-safe' : 'ops-chart-bar'}
              x={x - 9}
              y={PLOT_BOTTOM - rainHeight}
              width="18"
              height={rainHeight}
              rx="6"
            />
            <text className="ops-chart-day" x={x} y="143" textAnchor="middle">{point.day}</text>
          </g>
        );
      })}
      <polyline className="ops-chart-temperature" points={linePoints} />
      {data.map((point, index) => (
        <circle key={'temp-' + point.day + index} className="ops-chart-temperature-dot" cx={xAt(index)} cy={tempY(point.temp)} r="3.5" />
      ))}
    </svg>
  );
}
