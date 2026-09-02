import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Spinner,
  IconButton,
  Input,
  HStack,
} from '@chakra-ui/react'
import {
  Plus,
  Trash2,
  Copy,
  Check,
  KeyRound,
  RefreshCcw,
} from 'lucide-react'
import api from '../../api/axios'
import { toaster } from '../ui/toaster'

const AZUL = '#0052DC'

function formatoFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-VE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function GestionCodigos() {
  const [codigos, setCodigos] = useState([])
  const [estadisticas, setEstadisticas] = useState({ total: 0, activos: 0, usados: 0 })
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [copiado, setCopiado] = useState(null)

  const cargarDatos = useCallback(async () => {
    try {
      const [listaRes, statsRes] = await Promise.all([
        api.get('/admin/codigos-invitacion'),
        api.get('/admin/codigos-invitacion/estadisticas'),
      ])
      setCodigos(listaRes.data.codigos || [])
      setEstadisticas(statsRes.data)
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron cargar los códigos',
        type: 'error',
      })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  async function generarCodigos() {
    setGenerando(true)
    try {
      const { data } = await api.post('/admin/codigos-invitacion', { cantidad })
      const nuevos = data.codigos || []
      await cargarDatos()
      toaster.create({
        title: 'Códigos generados',
        description: nuevos.length === 1
          ? `Código generado: ${nuevos[0].codigo}`
          : `${nuevos.length} códigos generados`,
        type: 'success',
      })
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron generar los códigos',
        type: 'error',
      })
    } finally {
      setGenerando(false)
    }
  }

  async function eliminarCodigo(id) {
    try {
      await api.delete(`/admin/codigos-invitacion/${id}`)
      await cargarDatos()
      toaster.create({
        title: 'Código eliminado',
        type: 'success',
      })
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No se pudo eliminar el código',
        type: 'error',
      })
    }
  }

  async function copiarCodigo(codigo, id) {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(id)
      setTimeout(() => setCopiado(null), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  function estadoCodigo(c) {
    if (c.usado) return 'usado'
    if (c.expira_en && new Date(c.expira_en) < new Date()) return 'expirado'
    return 'activo'
  }

  if (cargando) {
    return (
      <Flex align="center" justify="center" direction="column" gap={3} minH="300px">
        <Spinner size="xl" color={AZUL} />
        <Text color="gray.500">Cargando códigos...</Text>
      </Flex>
    )
  }

  return (
    <Box maxW="1000px">
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={1}>🔑 Gestionar códigos</Heading>
        <Text color="gray.600">Genera y administra códigos de invitación honorífica</Text>
      </Box>

      {/* Tarjetas de estadísticas */}
      <SimpleGrid columns={[1, 3]} spacing={4} mb={6}>
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" p={5} boxShadow="sm">
          <Text fontSize="sm" color="gray.500" fontWeight="600">Total</Text>
          <Text fontSize="3xl" fontWeight="700" mt={1}>{estadisticas.total}</Text>
        </Box>
        <Box bg="white" border="1px" borderColor="green.200" borderRadius="lg" p={5} boxShadow="sm">
          <Text fontSize="sm" color="gray.500" fontWeight="600">Activos</Text>
          <Text fontSize="3xl" fontWeight="700" color="green.500" mt={1}>{estadisticas.activos}</Text>
        </Box>
        <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" p={5} boxShadow="sm">
          <Text fontSize="sm" color="gray.500" fontWeight="600">Usados</Text>
          <Text fontSize="3xl" fontWeight="700" color="gray.400" mt={1}>{estadisticas.usados}</Text>
        </Box>
      </SimpleGrid>

      {/* Panel de generación */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" p={5} mb={6} boxShadow="sm">
        <HStack mb={4} align="center">
          <KeyRound size={20} color={AZUL} />
          <Text fontWeight="600" fontSize="md">Generar código de invitación</Text>
        </HStack>
        <Text color="gray.500" fontSize="sm" mb={4}>
          Los códigos son alfanuméricos de 6 caracteres, de un solo uso y expiran a las 48 horas.
        </Text>
        <Flex gap={3} align="end" wrap="wrap">
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>Cantidad</Text>
            <Input
              type="number"
              min={1}
              max={20}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              width="100px"
            />
          </Box>
          <Button
            leftIcon={<Plus size={18} />}
            colorScheme="blue"
            onClick={generarCodigos}
            isLoading={generando}
            loadingText="Generando..."
          >
            Generar código
          </Button>
          <IconButton
            aria-label="Actualizar"
            icon={<RefreshCcw size={18} />}
            variant="outline"
            onClick={cargarDatos}
          />
        </Flex>
      </Box>

      {/* Tabla de códigos */}
      <Box bg="white" border="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden" boxShadow="sm">
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Text fontWeight="600">Códigos generados</Text>
        </Box>
        {codigos.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No hay códigos generados todavía</Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Código</Table.ColumnHeader>
                  <Table.ColumnHeader>Estado</Table.ColumnHeader>
                  <Table.ColumnHeader>Creado</Table.ColumnHeader>
                  <Table.ColumnHeader>Expira</Table.ColumnHeader>
                  <Table.ColumnHeader>Usado por</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Acciones</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {codigos.map((c) => {
                  const estado = estadoCodigo(c)
                  return (
                    <Table.Row key={c.id}>
                      <Table.Cell>
                        <HStack>
                          <Text fontWeight="700" fontFamily="mono" letterSpacing="1px">{c.codigo}</Text>
                          <IconButton
                            aria-label="Copiar"
                            size="xs"
                            variant="ghost"
                            icon={copiado === c.id ? <Check size={14} color="green.500" /> : <Copy size={14} />}
                            onClick={() => copiarCodigo(c.codigo, c.id)}
                          />
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        {estado === 'activo' && <Badge colorScheme="green">Activo</Badge>}
                        {estado === 'usado' && <Badge colorScheme="gray">Usado</Badge>}
                        {estado === 'expirado' && <Badge colorScheme="red">Expirado</Badge>}
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{formatoFecha(c.fecha_creacion)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{formatoFecha(c.expira_en)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {c.usado && c.users ? c.users.nombre || c.users.email : '—'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <IconButton
                          aria-label="Eliminar"
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Trash2 size={16} />}
                          onClick={() => eliminarCodigo(c.id)}
                        />
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default GestionCodigos
