import { useState } from 'react'
import {
  Dialog,
  Portal,
  Field,
  Input,
  Box,
  Text,
  Flex,
  Stack,
  HStack,
  Button,
} from '@chakra-ui/react'
import api from '../../api/axios'
import { toaster } from '../ui/toaster'

const AZUL = '#0052DC'
const INDIGO = '#1A1A3A'

function iniciales(nombre) {
  return (nombre?.trim()?.[0] || 'U').toUpperCase()
}

function DescuentoModal({ usuario, isOpen, onClose, onGuardado }) {
  const [porcentaje, setPorcentaje] = useState(usuario?.descuento_porcentaje || 0)
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    if (Number(porcentaje) < 0 || Number(porcentaje) > 100) {
      toaster.create({ title: 'El porcentaje debe estar entre 0 y 100', type: 'warning' })
      return
    }
    try {
      setGuardando(true)
      // Se guarda como un campo más del usuario en /users/:id.
      // Si más adelante manejas descuentos por producto/categoría, esto se movería a su propio endpoint.
      await api.patch(`/users/${usuario.id}`, { descuento_porcentaje: Number(porcentaje) })
      toaster.create({ title: 'Descuento guardado', type: 'success' })
      onGuardado?.()
      onClose()
    } catch (err) {
      console.error(err)
      toaster.create({ title: 'No se pudo guardar el descuento', type: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" borderRadius="xl">
            <Dialog.Header bg={INDIGO} color="white" borderTopRadius="xl">
              <Dialog.Title>Descuento de usuario</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger color="white" />
            <Dialog.Body py={5}>
              <HStack gap={3} mb={4}>
                <Flex align="center" justify="center" w="40px" h="40px" borderRadius="full" bg={AZUL} color="white" fontWeight="700">
                  {iniciales(usuario?.nombre)}
                </Flex>
                <Box>
                  <Text fontWeight="600" color={INDIGO}>{usuario?.nombre || 'Sin nombre'}</Text>
                  <Text fontSize="xs" color="gray.500">{usuario?.email}</Text>
                </Box>
              </HStack>

              <Field.Root>
                <Field.Label fontSize="sm">Porcentaje de descuento sobre todos los productos</Field.Label>
                <Flex align="center" gap={2}>
                  <Input
                    type="number" min="0" max="100" step="0.01"
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(e.target.value)}
                    placeholder="0.00"
                  />
                  <Text color="gray.400">%</Text>
                </Flex>
              </Field.Root>

              {porcentaje > 0 && (
                <Box bg="green.50" borderRadius="md" p={3} mt={3}>
                  <Text fontSize="xs" color="green.700">
                    Ejemplo: producto de $100.00 → paga <strong>${(100 - Number(porcentaje)).toFixed(2)}</strong>
                  </Text>
                </Box>
              )}
            </Dialog.Body>
            <Dialog.Footer borderTop="1px solid" borderColor="gray.100">
              <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
              <Button bg={AZUL} color="white" _hover={{ bg: '#0041B0' }} loading={guardando} onClick={guardar}>
                Guardar descuento
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default DescuentoModal
