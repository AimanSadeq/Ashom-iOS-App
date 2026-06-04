// Chart.js registration — import this once before using any chart component
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

// Shared chart theme options matching Ashom brand
export const CHART_COLORS = {
  brand:  '#010131',
  blue:   '#5391D5',
  teal:   '#00C896',
  amber:  '#ba7517',
  violet: '#534ab7',
  coral:  '#FF4B6E',
  forest: '#639922',
  danger: '#FF4B6E',
  gray:   '#9AA3BD',
  light:  '#E8ECF4',
};

export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.teal,
  CHART_COLORS.amber,
  CHART_COLORS.violet,
  CHART_COLORS.coral,
  CHART_COLORS.forest,
  CHART_COLORS.danger,
  CHART_COLORS.brand,
];

export const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#010131',
      titleFont: { family: 'Sora', size: 11, weight: '600' },
      bodyFont: { family: 'DM Sans', size: 11 },
      cornerRadius: 8,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9AA3BD' },
    },
    y: {
      grid: { color: '#E8ECF4' },
      ticks: { font: { family: 'DM Sans', size: 10 }, color: '#9AA3BD' },
    },
  },
};

export default ChartJS;
