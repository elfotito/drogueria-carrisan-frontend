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
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
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

function NuevoPagoModal({ clienteId, facturas, isOpen, onClose, onCreado }) {
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('abono')
  const [detalle, setDetalle] = useState('')
  const [seleccionadas, setSeleccionadas] = useState([])
  const [guardando, setGuardando] = useState(false)
  const toast = useToast()

  const facturasPendientes = (facturas || []).filter((f) => f.estado !== 'pagada')

  useEffect(() => {
    if (isOpen) {
      setMonto('')
      setTipo('abono')
      setDetalle('')
      setSeleccionadas([])
    }
  }, [isOpen])

  async function guardar() {
    if (!monto || Number(monto) <= 0) {
      toast({ title: 'Ingresa un monto válido', status: 'warning' })
      return
    }
    try {
      setGuardando(true)
      await api.post('/pagos', {
        usuario_id: clienteId,
        monto: Number(monto),
        tipo,
        detalle: detalle.trim() || undefined,
        factura_ids: seleccionadas.map(Number),
      })
      toast({ title: 'Pago registrado', status: 'success' })
      onCreado?.()
      onClose()
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.error || 'No se pudo registrar el pago'
      toast({ title: msg, status: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader bg={INDIGO} color="white" borderTopRadius="xl">Registrar pago</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={5}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Monto (USD)</FormLabel>
              <NumberInput value={monto} onChange={setMonto} min={0} precision={2}>
                <NumberInputField placeholder="0.00" />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Tipo</FormLabel>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="abono">Abono</option>
                <option value="pago_factura">Pago de factura</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Facturas a saldar (opcional)</FormLabel>
              {facturasPendientes.length === 0 ? (
                <Text fontSize="sm" color="gray.400">Este cliente no tiene facturas pendientes</Text>
              ) : (
                <Box maxH="200px" overflowY="auto" border="1px solid" borderColor="gray.100" borderRadius="lg" p={3}>
                  <CheckboxGroup value={seleccionadas} onChange={setSeleccionadas}>
                    <Stack spacing={2}>
                      {facturasPendientes.map((f) => (
                        <Checkbox key={f.id} value={String(f.id)}>
                          <Flex justify="space-between" w="100%" minW="280px">
                            <Text fontSize="sm">Factura #{f.numero_factura || f.id}</Text>
                            <Text fontSize="sm" fontWeight="600">${money(f.monto_facturado)}</Text>
                          </Flex>
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </Box>
              )}
              <FormHelperText>Si marcas facturas, quedarán como pagadas al guardar.</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Detalle (opcional)</FormLabel>
              <Textarea placeholder="Referencia, método de pago, etc." value={detalle} onChange={(e) => setDetalle(e.target.value)} rows={2} />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
          <Button bg={AZUL} color="white" _hover={{ bg: '#0041B0' }} isLoading={guardando} onClick={guardar}>
            Registrar pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NuevoPagoModal
