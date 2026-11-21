/**
 * Registro único de los componentes de Chart.js usados en la app.
 * Cualquier página con gráficos debe importar este módulo: así no depende
 * de que otra página (cargada con lazy) lo haya registrado antes.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export default ChartJS;
