import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Input,
  InputGroup,
  Badge,
  SimpleGrid,
  Stack,
  HStack,
  VStack,
  Spinner,
  Button,
  Separator,
  Icon,
  createListCollection,
} from '@chakra-ui/react'
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Search,
  RefreshCcw,
  Eye,
  Inbox,
} from 'lucide-react'
import api from '../../api/axios'
import EstadoCuentaDetalle from './EstadoCuentaDetalle'

const AZUL = '#0052DC'
const INDIGO = '#1A1A3A'

const COLUMNAS = [
  {
    id: 'excedido',
    titulo: 'Límite excedido',
    descripcion: 'Saldo negativo — requiere atención',
    color: 'red',
    match: (c) => Number(c.saldo) < 0,
  },
  {
    id: 'con-deuda',
    titulo: 'Con deuda activa',
    descripcion: 'Tienen órdenes pendientes por pagar',
    color: 'orange',
    match: (c) => Number(c.saldo) >= 0 && Number(c.deuda_actual) > 0,
  },
  {
    id: 'al-dia',
    titulo: 'Al día',
    descripcion: 'Sin deuda pendiente',
    color: 'green',
    match: (c) => Number(c.deuda_actual) <= 0,
  },
]

function money(n) {
  return Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function iniciales(nombre) {
  return (nombre?.trim()?.[0] || 'C').toUpperCase()
}

function AvatarCirculo({ nombre, size = '32px', bg = INDIGO }) {
  return (
    <Flex
      align="center"
      justify="center"
      w={size}
      h={size}
      minW={size}
      borderRadius="full"
      bg={bg}
      color="white"
      fontWeight="600"
      fontSize={size === '32px' ? 'sm' : 'md'}
    >
      {iniciales(nombre)}
    </Flex>
  )
}

function ClienteCard({ cliente, onVerDetalle }) {
  const usoLinea = cliente.linea_credito > 0
    ? Math.min(100, (Number(cliente.deuda_actual) / Number(cliente.linea_credito)) * 100)
    : 0

  const barraColor = usoLinea >= 100 ? 'red.400' : usoLinea >= 75 ? 'orange.400' : AZUL

  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={4}
      boxShadow="0 1px 3px rgba(26,26,58,0.08)"
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.15s ease"
      _hover={{ boxShadow: '0 6px 20px rgba(26,26,58,0.12)', transform: 'translateY(-2px)', borderColor: 'gray.200' }}
    >
      <HStack gap={3} align="start">
        <AvatarCirculo nombre={cliente.nombre} />
        <Box flex={1} minW={0}>
          <Text fontWeight="600" color={INDIGO} lineClamp={1}>
            {cliente.nombre || 'Sin nombre'}
          </Text>
          {cliente.email && (
            <Text fontSize="xs" color="gray.500" lineClamp={1}>
              {cliente.email}
            </Text>
          )}
        </Box>
      </HStack>

      <Separator my={3} />

      <VStack align="stretch" gap={1.5} fontSize="sm">
        <Flex justify="space-between">
          <Text color="gray.500">Línea de crédito</Text>
          <Text fontWeight="600" color={INDIGO}>${money(cliente.linea_credito)}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text color="gray.500">Deuda actual</Text>
          <Text fontWeight="600" color={cliente.deuda_actual > 0 ? 'orange.500' : 'gray.700'}>
            ${money(cliente.deuda_actual)}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Text color="gray.500">Saldo disponible</Text>
          <Text fontWeight="700" color={cliente.saldo >= 0 ? 'green.600' : 'red.500'}>
            {cliente.saldo >= 0 ? '+' : ''}${money(cliente.saldo)}
          </Text>
        </Flex>
      </VStack>

      {cliente.linea_credito > 0 && (
        <Box mt={3}>
          <Box h="6px" bg="gray.100" borderRadius="full" overflow="hidden">
            <Box h="100%" w={`${usoLinea}%`} bg={barraColor} borderRadius="full" transition="width 0.2s" />
          </Box>
          <Text fontSize="xs" color="gray.400" mt={1}>{usoLinea.toFixed(0)}% de línea utilizada</Text>
        </Box>
      )}

      <Button
        mt={4}
        size="sm"
        w="full"
        variant="outline"
        borderColor={AZUL}
        color={AZUL}
        _hover={{ bg: AZUL, color: 'white' }}
        onClick={() => onVerDetalle(cliente.id)}
      >
        <Eye size={15} />
        Ver detalle
      </Button>
    </Box>
  )
}

function StatCard({ icon, label, value, color = INDIGO, prefix = '' }) {
  return (
    <Box bg="white" borderRadius="xl" p={4} boxShadow="0 1px 3px rgba(26,26,58,0.08)" border="1px solid" borderColor="gray.100">
      <HStack gap={3}>
        <Flex align="center" justify="center" w="40px" h="40px" borderRadius="lg" bg={`${color}15`}>
          <Icon as={icon} boxSize={5} color={color} />
        </Flex>
        <Box>
          <Text fontSize="xl" fontWeight="700" color={INDIGO} lineHeight="1.1">
            {prefix}{value}
          </Text>
          <Text fontSize="xs" color="gray.500">{label}</Text>
        </Box>
      </HStack>
    </Box>
  )
}

function EstadoCuentaAdmin() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null)
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('deuda')

  useEffect(() => {
    cargarClientes()
  }, [])

  async function cargarClientes() {
    try {
      setCargando(true)
      setError('')
      const { data } = await api.get('/clientes/estado-cuenta')
      setClientes(data)
    } catch (err) {
      setError('No se pudo cargar el estado de cuenta')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  function abrirDetalle(id) {
    setClienteSeleccionadoId(id)
    setDetalleAbierto(true)
  }

  function cerrarDetalle() {
    setDetalleAbierto(false)
    setClienteSeleccionadoId(null)
    cargarClientes()
  }

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]
    if (busqueda) {
      const texto = busqueda.toLowerCase()
      resultado = resultado.filter(
        (c) => c.nombre?.toLowerCase().includes(texto) || c.email?.toLowerCase().includes(texto)
      )
    }
    resultado.sort((a, b) => {
      const campo = { deuda: 'deuda_actual', credito: 'linea_credito', saldo: 'saldo', nombre: 'nombre' }[ordenarPor]
      if (campo === 'nombre') return (a.nombre || '').localeCompare(b.nombre || '')
      return Number(b[campo] || 0) - Number(a[campo] || 0)
    })
    return resultado
  }, [clientes, busqueda, ordenarPor])

  const columnas = useMemo(() => {
    return COLUMNAS.map((col) => ({
      ...col,
      clientes: clientesFiltrados.filter(col.match),
    }))
  }, [clientesFiltrados])

  const stats = useMemo(() => {
    const total = clientes.length
    const conDeuda = clientes.filter((c) => c.deuda_actual > 0).length
    const alDia = clientes.filter((c) => c.deuda_actual <= 0).length
    const deudaTotal = clientes.reduce((sum, c) => sum + Number(c.deuda_actual || 0), 0)
    return { total, conDeuda, alDia, deudaTotal }
  }, [clientes])

  if (cargando) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" gap={3}>
        <Spinner size="xl" color={AZUL} borderWidth="3px" />
        <Text color="gray.500">Cargando estado de cuenta...</Text>
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" gap={3}>
        <Text color="red.500">{error}</Text>
        <Button onClick={cargarClientes} colorPalette="blue">
          <RefreshCcw size={16} />
          Reintentar
        </Button>
      </Flex>
    )
  }

  return (
    <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color={INDIGO}>Estado de Cuenta</Heading>
          <Text color="gray.500" fontSize="sm">Panel administrativo de crédito y cobranza</Text>
        </Box>
        <Button variant="ghost" onClick={cargarClientes} color={AZUL}>
          <RefreshCcw size={16} />
          Actualizar
        </Button>
      </Flex>

      {/* Estadísticas */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
        <StatCard icon={Users} label="Total clientes" value={stats.total} />
        <StatCard icon={AlertTriangle} label="Con deuda" value={stats.conDeuda} color="orange.500" />
        <StatCard icon={CheckCircle2} label="Al día" value={stats.alDia} color="green.500" />
        <StatCard icon={DollarSign} label="Deuda total" value={money(stats.deudaTotal)} prefix="$" color={AZUL} />
      </SimpleGrid>

      {/* Toolbar */}
      <Flex
        bg="white"
        borderRadius="xl"
        p={3}
        mb={6}
        boxShadow="0 1px 3px rgba(26,26,58,0.08)"
        border="1px solid"
        borderColor="gray.100"
        gap={3}
        wrap="wrap"
        align="center"
      >
        <InputGroup maxW="320px" startElement={<Search size={16} color="#9CA3AF" />}>
          <Input
            placeholder="Buscar cliente por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            borderRadius="lg"
          />
        </InputGroup>

        {/* Select nativo — evita depender de la API compuesta de Select en Chakra v3 */}
        <Box
          as="select"
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          maxW="220px"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          px={3}
          py={2}
          fontSize="sm"
          bg="white"
        >
          <option value="deuda">Ordenar por deuda</option>
          <option value="credito">Ordenar por línea de crédito</option>
          <option value="saldo">Ordenar por saldo</option>
          <option value="nombre">Ordenar por nombre</option>
        </Box>
      </Flex>

      {/* Kanban */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={5}>
        {columnas.map((col) => (
          <GridItem key={col.id}>
            <Flex align="center" justify="space-between" mb={3} px={1}>
              <HStack>
                <Box w="8px" h="8px" borderRadius="full" bg={`${col.color}.400`} />
                <Text fontWeight="700" color={INDIGO}>{col.titulo}</Text>
                <Badge colorPalette={col.color} borderRadius="full">{col.clientes.length}</Badge>
              </HStack>
            </Flex>
            <Text fontSize="xs" color="gray.500" mb={3} px={1}>{col.descripcion}</Text>

            <Box
              bg="gray.100"
              borderRadius="xl"
              p={3}
              minH="200px"
              maxH="calc(100vh - 340px)"
              overflowY="auto"
            >
              <Stack gap={3}>
                {col.clientes.length === 0 ? (
                  <Flex direction="column" align="center" justify="center" py={10} color="gray.400">
                    <Inbox size={28} />
                    <Text fontSize="sm" mt={2}>Sin clientes en esta columna</Text>
                  </Flex>
                ) : (
                  col.clientes.map((cliente) => (
                    <ClienteCard key={cliente.id} cliente={cliente} onVerDetalle={abrirDetalle} />
                  ))
                )}
              </Stack>
            </Box>
          </GridItem>
        ))}
      </Grid>

      {/* Modal de detalle */}
      <EstadoCuentaDetalle
        clienteId={clienteSeleccionadoId}
        isOpen={detalleAbierto}
        onClose={cerrarDetalle}
      />
    </Box>
  )
}

export default EstadoCuentaAdmin
