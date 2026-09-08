import { Box, Heading, Tabs } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AnalyticsVentas from './AnalyticsVentas';
import EstadosCuentaClientes from './EstadosCuentaClientes';
import EstadisticasProductos from './EstadisticasProductos';

const INDIGO = '#1A1A3A';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/products/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Error al cargar stats de productos:', err));
  }, []);

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="lg" color={INDIGO} mb={6}>
        Analítica
      </Heading>

      <Tabs.Root defaultValue="ventas" variant="line">
        <Tabs.List>
          <Tabs.Trigger value="ventas">Ventas</Tabs.Trigger>
          <Tabs.Trigger value="clientes">Estados de cuenta</Tabs.Trigger>
          <Tabs.Trigger value="productos">Productos</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="ventas">
          <AnalyticsVentas />
        </Tabs.Content>
        <Tabs.Content value="clientes">
          <EstadosCuentaClientes />
        </Tabs.Content>
        <Tabs.Content value="productos">
          <EstadisticasProductos stats={stats} />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}