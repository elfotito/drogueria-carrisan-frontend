import { Box, Heading, Tabs } from '@chakra-ui/react';
import AnalyticsVentas from './AnalyticsVentas';
import EstadosCuentaClientes from './EstadosCuentaClientes';
import EstadisticasProductos from './EstadisticasProductos';

const INDIGO = '#1A1A3A';

export default function AnalyticsPage() {
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
          <EstadisticasProductos />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}