import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Flex,
  Text,
  Avatar,
  Badge,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  HStack,
  VStack,
  Tooltip,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { FileText, Wallet, ShoppingCart, Plus, Receipt, CreditCard } from 'lucide-react'
import api from '../../api/axios'
import NuevaFacturaModal from './NuevaFacturaModal'
import NuevoPagoModal from './NuevoPagoModal'

const AZUL = '#0052DC'
const INDIGO = '#1A1A3A'

function money(n) {
  return Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ESTADO_ORDEN_COLOR = {
  pendiente: 'yellow',
  enviado: 'blue',
  entregado: 'green',
  cancelado: 'red',
}

const ESTADO_PAGO_COLOR = {
  pendiente_verificacion: 'orange',
  verificado: 'green',
}

function ResumenCard({ icon, label, value, color = INDIGO }) {
  return (
    <Box bg="gray.50" borderRadius="lg" p={4} border="1px solid" borderColor="gray.100">
      <HStack spacing={3}>
        <Flex align="center" justify="center" w="36px" h="36px" borderRadius="lg" bg={`${color}15`}>
          <Box as={icon} size={18} color={color} />
        </Flex>
        <Box>
          <Text fontSize="lg" fontWeight="700" color={INDIGO}>{value}</Text>
          <Text fontSize="xs" color="gray.500">{label}</Text>
        </Box>
      </HStack>
    </Box>
  )
}

function EstadoCuentaDetalle({ clienteId, isOpen, onClose }) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()
  const facturaModal = useDisclosure()
  const pagoModal = useDisclosure()

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarDetalle()
    } else {
      setDatos(null)
    }
  }, [isOpen, clienteId])

  async function cargarDetalle() {
    try {
      setCargando(true)
      setError('')
      const { data } = await api.get(`/clientes/${clienteId}/estado-cuenta`)
      setDatos(data)
    } catch (err) {
      setError('No se pudo cargar el detalle del cliente')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  // Placeholders — se conectan a medida que se agreguen los endpoints de escritura
  function proximamente(funcion) {
    toast({
      title: `${funcion} — próximamente`,
      description: 'Esta función se agregará en la siguiente iteración del panel.',
      status: 'info',
      duration: 2500,
      isClosable: true,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader bg={INDIGO} color="white" borderTopRadius="xl">
          {cargando || !datos ? (
            'Cargando cliente...'
          ) : (
            <HStack spacing={3}>
              <Avatar name={datos.cliente?.nombre} size="sm" bg={AZUL} color="white" />
              <Box>
                <Text fontSize="md">{datos.cliente?.nombre || 'Sin nombre'}</Text>
                <Text fontSize="xs" fontWeight="400" opacity={0.8}>{datos.cliente?.email}</Text>
              </Box>
            </HStack>
          )}
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody bg="gray.50" pb={6}>
          {cargando ? (
            <Flex align="center" justify="center" minH="300px">
              <Spinner size="lg" color={AZUL} thickness="3px" />
            </Flex>
          ) : error ? (
            <Flex align="center" justify="center" minH="300px" direction="column" gap={3}>
              <Text color="red.500">{error}</Text>
              <Button onClick={cargarDetalle} colorScheme="blue" size="sm">Reintentar</Button>
            </Flex>
          ) : datos ? (
            <VStack align="stretch" spacing={5} pt={4}>
              {/* Resumen bancario */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                <ResumenCard icon={Wallet} label="Línea de crédito" value={`$${money(datos.resumen?.linea_credito)}`} />
                <ResumenCard icon={FileText} label="Deuda actual" value={`$${money(datos.resumen?.deuda_actual)}`} color="orange.500" />
                <ResumenCard
                  icon={CreditCard}
                  label="Saldo disponible"
                  value={`${datos.resumen?.saldo >= 0 ? '+' : ''}$${money(datos.resumen?.saldo)}`}
                  color={datos.resumen?.saldo >= 0 ? 'green.500' : 'red.500'}
                />
                <ResumenCard icon={ShoppingCart} label="Órdenes pendientes" value={datos.ordenes_pendientes?.length || 0} />
              </SimpleGrid>

              {/* Acciones rápidas — se activan a medida que se conecten los endpoints */}
              <HStack spacing={3} wrap="wrap">
                <Button size="sm" leftIcon={<Plus size={15} />} colorScheme="blue" onClick={() => proximamente('Agregar orden')}>
                  Agregar orden
                </Button>
                <Button size="sm" leftIcon={<Receipt size={15} />} variant="outline" borderColor={AZUL} color={AZUL} onClick={facturaModal.onOpen}>
                  Agregar factura
                </Button>
                <Button size="sm" leftIcon={<CreditCard size={15} />} variant="outline" borderColor={AZUL} color={AZUL} onClick={pagoModal.onOpen}>
                  Agregar pago
                </Button>
              </HStack>

              {/* Tabs con el detalle */}
              <Tabs colorScheme="blue" variant="soft-rounded" size="sm">
                <TabList>
                  <Tab>Órdenes pendientes</Tab>
                  <Tab>Facturas</Tab>
                  <Tab>Pagos</Tab>
                </TabList>
                <TabPanels>
                  {/* Órdenes pendientes */}
                  <TabPanel px={0}>
                    <Box bg="white" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.100">
                      <Table size="sm">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Orden</Th>
                            <Th>Fecha</Th>
                            <Th>Forma de pago</Th>
                            <Th>Estado</Th>
                            <Th isNumeric>Monto</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(datos.ordenes_pendientes || []).length === 0 ? (
                            <Tr><Td colSpan={5}><Text py={4} textAlign="center" color="gray.400">Sin órdenes pendientes</Text></Td></Tr>
                          ) : (
                            datos.ordenes_pendientes.map((o) => (
                              <Tr key={o.id}>
                                <Td>#{o.id}</Td>
                                <Td>{fecha(o.created_at)}</Td>
                                <Td textTransform="capitalize">{o.forma_pago}</Td>
                                <Td>
                                  <Badge colorScheme={ESTADO_ORDEN_COLOR[o.estado] || 'gray'} borderRadius="full">
                                    {o.estado}
                                  </Badge>
                                </Td>
                                <Td isNumeric fontWeight="600">${money(o.total_usd)}</Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* Facturas */}
                  <TabPanel px={0}>
                    <Box bg="white" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.100">
                      <Table size="sm">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Factura</Th>
                            <Th>Fecha</Th>
                            <Th isNumeric>Tasa usada</Th>
                            <Th isNumeric>Monto</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(datos.facturas || []).length === 0 ? (
                            <Tr><Td colSpan={4}><Text py={4} textAlign="center" color="gray.400">Sin facturas registradas</Text></Td></Tr>
                          ) : (
                            datos.facturas.map((f) => (
                              <Tr key={f.id}>
                                <Td>#{f.numero_factura || f.id}</Td>
                                <Td>{fecha(f.created_at)}</Td>
                                <Td isNumeric>{f.tasa_cambio ? money(f.tasa_cambio) : '—'}</Td>
                                <Td isNumeric fontWeight="600">${money(f.monto_facturado)}</Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>

                  {/* Pagos */}
                  <TabPanel px={0}>
                    <Box bg="white" borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.100">
                      <Table size="sm">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th>Pago</Th>
                            <Th>Fecha</Th>
                            <Th>Estado</Th>
                            <Th isNumeric>Monto</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(datos.pagos || []).length === 0 ? (
                            <Tr><Td colSpan={4}><Text py={4} textAlign="center" color="gray.400">Sin pagos registrados</Text></Td></Tr>
                          ) : (
                            datos.pagos.map((p) => (
                              <Tr key={p.id}>
                                <Td>#{p.id}</Td>
                                <Td>{fecha(p.created_at)}</Td>
                                <Td>
                                  <Badge colorScheme={ESTADO_PAGO_COLOR[p.estado] || 'gray'} borderRadius="full">
                                    {p.estado?.replace('_', ' ') || '—'}
                                  </Badge>
                                </Td>
                                <Td isNumeric fontWeight="600">${money(p.monto)}</Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          ) : null}
        </ModalBody>
      </ModalContent>

      <NuevaFacturaModal
        clienteId={clienteId}
        isOpen={facturaModal.isOpen}
        onClose={facturaModal.onClose}
        onCreada={cargarDetalle}
      />
      <NuevoPagoModal
        clienteId={clienteId}
        facturas={datos?.facturas}
        isOpen={pagoModal.isOpen}
        onClose={pagoModal.onClose}
        onCreado={cargarDetalle}
      />
    </Modal>
  )
}

export default EstadoCuentaDetalle

