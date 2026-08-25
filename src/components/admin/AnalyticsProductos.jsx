import { useState, useEffect, useCallback } from 'react';
import {
  Box, Table, Spinner, Text, Flex, Button, Input
} from '@chakra-ui/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';

const AZUL = '#0052DC';
const INDIGO = '#1A1A3A';

const COLUMNAS = [
  { header: 'Producto', key: 'nombre' },
  { header: 'Cantidad vendida', key: 'cantidad_vendida' },
  { header: 'Ingresos', key: 'ingresos_usd' }
];

function formatoUsd(valor) {
  return `$${Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function fechaDefaultDesde() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function fechaDefaultHasta() {
  return new Date().toISOString().slice(0, 10);
}

export default function EstadisticasProductos() {
  const [desde, setDesde] = useState(fechaDefaultDesde());
  const [hasta, setHasta] = useState(fechaDefaultHasta());
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ desde, hasta, limite: '10' });
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/analytics/productos?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar');
      setProductos(await res.json());
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el top de productos.');
    } finally {
      setCargando(false);
    }
  }, [desde, hasta]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const filasParaExportar = productos.map(p => ({
    ...p,
    ingresos_usd: formatoUsd(p.ingresos_usd)
  }));

  // Nombres truncados para que el gráfico no se vea apretado.
  const datosGrafico = productos.map(p => ({
    ...p,
    nombreCorto: p.nombre.length > 18 ? `${p.nombre.slice(0, 18)}…` : p.nombre
  }));

  return (
    <Box pt={4}>
      <Flex gap={4} mb={4} flexWrap="wrap" align="flex-end" justify="space-between">
        <Flex gap={4} flexWrap="wrap" align="flex-end">
          <Box>
            <Text fontSize="sm" mb={1} color="gray.600">Desde</Text>
            <Input type="date" value={desde} max={hasta} onChange={e => setDesde(e.target.value)} />
          </Box>
          <Box>
            <Text fontSize="sm" mb={1} color="gray.600">Hasta</Text>
            <Input type="date" value={hasta} min={desde} onChange={e => setHasta(e.target.value)} />
          </Box>
        </Flex>

        <Flex gap={2}>
          <Button size="sm" variant="outline" onClick={() => exportToExcel(filasParaExportar, COLUMNAS, 'top-productos')}>
            Exportar Excel
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToPdf(filasParaExportar, COLUMNAS, 'top-productos', 'Top productos más vendidos')}>
            Exportar PDF
          </Button>
        </Flex>
      </Flex>

      {cargando && <Flex justify="center" py={10}><Spinner size="lg" color={AZUL} /></Flex>}
      {error && <Text color="red.500">{error}</Text>}

      {!cargando && !error && (
        <>
          <Box borderWidth="1px" borderRadius="lg" p={4} h="320px" mb={6}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="nombreCorto" fontSize={12} width={140} />
                <Tooltip formatter={(valor, nombre) => nombre === 'cantidad_vendida' ? valor : formatoUsd(valor)} />
                <Bar dataKey="cantidad_vendida" fill={AZUL} name="Unidades vendidas" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Table.Root size="sm" striped>
            <Table.Header>
              <Table.Row>
                {COLUMNAS.map(col => <Table.ColumnHeader key={col.key}>{col.header}</Table.ColumnHeader>)}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {productos.map(p => (
                <Table.Row key={p.producto_id}>
                  <Table.Cell>{p.nombre}</Table.Cell>
                  <Table.Cell>{p.cantidad_vendida}</Table.Cell>
                  <Table.Cell>{formatoUsd(p.ingresos_usd)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </>
      )}
    </Box>
  );
}