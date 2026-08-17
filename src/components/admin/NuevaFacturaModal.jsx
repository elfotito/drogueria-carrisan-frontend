import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
  Stack,
  Box,
  Text,
  Flex,
  Button,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import api from '../../api/axios'

const AZUL = '#0052DC'
const INDIGO = '#1A1A3A'

function money(n) {
  return Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function NuevaFacturaModal({ clienteId, isOpen, onClose, onCreada }) {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [seleccionadas, setSeleccionadas] = useState([])
  const [numeroFactura, setNumeroFactura] = useState('')
  const [montoManual, setMontoManual] = useState('')
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen && clienteId) {
      cargarOrdenesSinFacturar()
      setSeleccionadas([])
      setNumeroFactura('')
      setMontoManual('')
      setNota('')
    }
  }, [isOpen, clienteId])

  async function cargarOrdenesSinFacturar() {
    try {
      setCargando(true)
      const { data } = await api.get(`/facturas/sin-facturar/${clienteId}`)
      setOrdenes(data)
    } catch (err) {
      console.error(err)
      toast({ title: 'No se pudieron cargar las órdenes sin facturar', status: 'error' })
    } finally {
      setCargando(false)
    }
  }

  const totalSeleccionado = ordenes
    .filter((o) => seleccionadas.includes(String(o.id)))
    .reduce((sum, o) => sum + Number(o.total_usd || 0), 0)

  const montoFinal = montoManual !== '' ? Number(montoManual) : totalSeleccionado

  async function guardar() {
    if (!numeroFactura.trim()) {
      toast({ title: 'Ingresa el número de factura', status: 'warning' })
      return
    }
    if (!montoFinal || montoFinal <= 0) {
      toast({ title: 'El monto facturado debe ser mayor a 0', status: 'warning' })
      return
    }
    try {
      setGuardando(true)
      await api.post('/facturas', {
        usuario_id: clienteId,
        numero_factura: numeroFactura.trim(),
        monto_facturado: montoFinal,
        nota: nota.trim() || undefined,
        orden_ids: seleccionadas.map(Number),
      })
      toast({ title: 'Factura registrada', status: 'success' })
      onCreada?.()
      onClose()
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.error || 'No se pudo registrar la factura'
      toast({ title: msg, status: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader bg={INDIGO} color="white" borderTopRadius="xl">Registrar factura</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={5}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Número de factura</FormLabel>
              <Input
                placeholder="Ej: 00123"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Órdenes a incluir (opcional)</FormLabel>
              {cargando ? (
                <Flex justify="center" py={4}><Spinner size="sm" color={AZUL} /></Flex>
              ) : ordenes.length === 0 ? (
                <Text fontSize="sm" color="gray.400">Este cliente no tiene órdenes sin facturar</Text>
              ) : (
                <Box maxH="220px" overflowY="auto" border="1px solid" borderColor="gray.100" borderRadius="lg" p={3}>
                  <CheckboxGroup value={seleccionadas} onChange={setSeleccionadas}>
                    <Stack spacing={2}>
                      {ordenes.map((o) => (
                        <Checkbox key={o.id} value={String(o.id)}>
                          <Flex justify="space-between" w="100%" minW="280px">
                            <Text fontSize="sm">Orden #{o.id} · {o.forma_pago}</Text>
                            <Text fontSize="sm" fontWeight="600">${money(o.total_usd)}</Text>
                          </Flex>
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </Box>
              )}
              <FormHelperText>Puedes dejarlo vacío si es una factura sin órdenes web (ej. pedido telefónico).</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Monto facturado (USD)</FormLabel>
              <NumberInput
                value={montoManual !== '' ? montoManual : (totalSeleccionado || '')}
                onChange={(v) => setMontoManual(v)}
                min={0}
                precision={2}
              >
                <NumberInputField placeholder="0.00" />
              </NumberInput>
              <FormHelperText>
                Se autocompleta con la suma de las órdenes seleccionadas (${money(totalSeleccionado)}). Puedes editarlo.
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Nota (opcional)</FormLabel>
              <Textarea placeholder="Referencia interna..." value={nota} onChange={(e) => setNota(e.target.value)} rows={2} />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
          <Button bg={AZUL} color="white" _hover={{ bg: '#0041B0' }} isLoading={guardando} onClick={guardar}>
            Registrar factura
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NuevaFacturaModal