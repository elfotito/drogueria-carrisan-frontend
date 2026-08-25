import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatValueText,
  StatHelpText,
  Select,
  createListCollection,
  Spinner,
  Text,
  Flex,
  Input
} from '@chakra-ui/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';

const AZUL = '#0052DC';
const INDIGO = '#1A1A3A';


const agrupacionesCollection = createListCollection({
  items: [
    { label: 'Por día', value: 'dia' },
    { label: 'Por semana', value: 'semana' },
    { label: 'Por mes', value: 'mes' }
  ]
});

function formatoUsd(valor) {
  return `$${Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fechaDefaultDesde() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function fechaDefaultHasta() {
  return new Date().toISOString().slice(0, 10);
}

export default function AnalyticsVentas() {
  const [desde, setDesde] = useState(fechaDefaultDesde());
  const [hasta, setHasta] = useState(fechaDefaultHasta());
  const [agrupacion, setAgrupacion] = useState('dia');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ desde, hasta, agrupacion });
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/analytics/ventas?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar la analítica');
      const data = await res.json();
      setDatos(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la analítica de ventas.');
    } finally {
      setCargando(false);
    }
  }, [desde, hasta, agrupacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

const COLUMNAS_VENTAS = [
  { header: 'Período', key: 'periodo' },
  { header: 'Total vendido', key: 'total' },
  { header: 'Órdenes', key: 'cantidad_ordenes' }
];

  const filasParaExportar = datos?.serie.map(p => ({
  ...p,
  total: formatoUsd(p.total)
})) || [];

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="lg" color={INDIGO} mb={6}>
        Analítica de ventas
      </Heading>

      <Flex gap={4} mb={6} flexWrap="wrap" align="flex-end">
        <Box>
          <Text fontSize="sm" mb={1} color="gray.600">Desde</Text>
          <Input type="date" value={desde} max={hasta} onChange={e => setDesde(e.target.value)} />
        </Box>
        <Box>
          <Text fontSize="sm" mb={1} color="gray.600">Hasta</Text>
          <Input type="date" value={hasta} min={desde} onChange={e => setHasta(e.target.value)} />
        </Box>
        <Box minW="180px">
          <Text fontSize="sm" mb={1} color="gray.600">Agrupar por</Text>
          <Select.Root
            collection={agrupacionesCollection}
            value={[agrupacion]}
            onValueChange={e => setAgrupacion(e.value[0])}
          >
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.Content>
              {agrupacionesCollection.items.map(item => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>

      {cargando && (
        <Flex justify="center" py={10}><Spinner size="lg" color={AZUL} /></Flex>
      )}

      {error && <Text color="red.500">{error}</Text>}

      {!cargando && !error && datos && (
        <>
<Flex justify="flex-end" gap={2} mb={4}>
  <Button size="sm" variant="outline" onClick={() => exportToExcel(filasParaExportar, COLUMNAS_VENTAS, 'ventas-por-periodo')}>
    Exportar Excel
  </Button>
  <Button size="sm" variant="outline" onClick={() => exportToPdf(filasParaExportar, COLUMNAS_VENTAS, 'ventas-por-periodo', 'Ventas por período')}>
    Exportar PDF
  </Button>
</Flex>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={8}>
            <Stat.Root borderWidth="1px" borderRadius="lg" p={4}>
              <StatLabel>Total vendido</StatLabel>
              <StatValueText color={INDIGO}>{formatoUsd(datos.resumen.total_usd)}</StatValueText>
              {datos.resumen.variacion_porcentual !== null && (
                <StatHelpText color={datos.resumen.variacion_porcentual >= 0 ? 'green.500' : 'red.500'}>
                  {datos.resumen.variacion_porcentual >= 0 ? '↑' : '↓'} {Math.abs(datos.resumen.variacion_porcentual).toFixed(1)}% vs. período anterior
                </StatHelpText>
              )}
            </Stat.Root>

            <Stat.Root borderWidth="1px" borderRadius="lg" p={4}>
              <StatLabel>Órdenes</StatLabel>
              <StatValueText color={INDIGO}>{datos.resumen.cantidad_ordenes}</StatValueText>
            </Stat.Root>

            <Stat.Root borderWidth="1px" borderRadius="lg" p={4}>
              <StatLabel>Promedio por orden</StatLabel>
              <StatValueText color={INDIGO}>{formatoUsd(datos.resumen.promedio_por_orden)}</StatValueText>
            </Stat.Root>
          </SimpleGrid>

          <Box borderWidth="1px" borderRadius="lg" p={4} h="360px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serieParaGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="etiqueta" fontSize={12} />
                <YAxis
                  fontSize={12}
                  tickFormatter={valor => `$${valor >= 1000 ? `${(valor / 1000).toFixed(0)}k` : valor}`}
                />
                <Tooltip formatter={valor => formatoUsd(valor)} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={AZUL}
                  strokeWidth={2}
                  dot={{ fill: AZUL, r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Ventas"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Box>
  );
}