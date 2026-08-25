import { useState, useEffect } from 'react';
import {
  Box, Table, Spinner, Text, Flex, Button, Badge
} from '@chakra-ui/react';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';

const INDIGO = '#1A1A3A';

const COLUMNAS = [
  { header: 'Cliente', key: 'nombre' },
  { header: 'Email', key: 'email' },
  { header: 'Línea de crédito', key: 'linea_credito' },
  { header: 'Facturado', key: 'total_facturado' },
  { header: 'Pagado', key: 'total_pagado' },
  { header: 'Deuda actual', key: 'deuda_actual' },
  { header: 'Saldo disponible', key: 'saldo_disponible' }
];

function formatoUsd(valor) {
  return `$${Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function EstadosCuentaClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/analytics/clientes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar');
        setClientes(await res.json());
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el estado de cuenta de clientes.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Para exportar, mandamos los valores ya formateados en USD como texto.
  const filasParaExportar = clientes.map(c => ({
    ...c,
    linea_credito: formatoUsd(c.linea_credito),
    total_facturado: formatoUsd(c.total_facturado),
    total_pagado: formatoUsd(c.total_pagado),
    deuda_actual: formatoUsd(c.deuda_actual),
    saldo_disponible: formatoUsd(c.saldo_disponible)
  }));

  return (
    <Box pt={4}>
      <Flex justify="flex-end" gap={2} mb={4}>
        <Button size="sm" variant="outline" onClick={() => exportToExcel(filasParaExportar, COLUMNAS, 'estados-cuenta-clientes')}>
          Exportar Excel
        </Button>
        <Button size="sm" variant="outline" onClick={() => exportToPdf(filasParaExportar, COLUMNAS, 'estados-cuenta-clientes', 'Estados de cuenta — Clientes')}>
          Exportar PDF
        </Button>
      </Flex>

      {cargando && <Flex justify="center" py={10}><Spinner size="lg" color={INDIGO} /></Flex>}
      {error && <Text color="red.500">{error}</Text>}

      {!cargando && !error && (
        <Table.Root size="sm" striped>
          <Table.Header>
            <Table.Row>
              {COLUMNAS.map(col => <Table.ColumnHeader key={col.key}>{col.header}</Table.ColumnHeader>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {clientes.map(c => (
              <Table.Row key={c.id}>
                <Table.Cell>{c.nombre}</Table.Cell>
                <Table.Cell>{c.email}</Table.Cell>
                <Table.Cell>{formatoUsd(c.linea_credito)}</Table.Cell>
                <Table.Cell>{formatoUsd(c.total_facturado)}</Table.Cell>
                <Table.Cell>{formatoUsd(c.total_pagado)}</Table.Cell>
                <Table.Cell>{formatoUsd(c.deuda_actual)}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={c.saldo_disponible >= 0 ? 'green' : 'red'}>
                    {formatoUsd(c.saldo_disponible)}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
}