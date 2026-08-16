import { useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Input, Select, Textarea, VStack,
  Box, Text, useToast,
} from '@chakra-ui/react'
import MapaPicker from './MapaPicker'

const TARIFAS_DELIVERY = {
  Valencia: 3, Naguanagua: 4, 'San Diego': 5, Guacara: 5, 'Los Guayos': 5,
}
const AGENCIAS = ['MRW', 'Domesa', 'Tealca', 'Zoom']

function AgregarDireccionModal({ isOpen, onClose, tipo, guardarDireccion, onGuardada }) {
  const toast = useToast()
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '', direccion: '', ciudad: 'Valencia', estado: 'Carabobo',
    telefono_contacto: '', cedula: '', agencia_preferida: '', coordenadas: null,
  })

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      const payload = tipo === 'delivery'
        ? { ...form, costo_delivery: TARIFAS_DELIVERY[form.ciudad] }
        : form

      const nueva = await guardarDireccion(payload) // ya selecciona automático dentro del contexto
      toast({ title: 'Dirección guardada', status: 'success', duration: 2500 })
      onGuardada?.(nueva)
      onClose()
    } catch (err) {
      toast({ title: 'No se pudo guardar la dirección', status: 'error', duration: 3000 })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'lg' }} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent
        borderRadius={{ base: 0, md: '16px' }}
        maxH={{ base: '100dvh', md: '85vh' }} // 🆕 evita el desplazamiento raro del teclado en móvil
      >
        <ModalHeader>
          {tipo === 'delivery' ? 'Agregar dirección de delivery' : 'Agregar destino de envío nacional'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {tipo === 'delivery' && (
              <>
                <Select value={form.ciudad} onChange={set('ciudad')}>
                  {Object.keys(TARIFAS_DELIVERY).map((c) => (
                    <option key={c} value={c}>{c} - ${TARIFAS_DELIVERY[c]}</option>
                  ))}
                </Select>
                <Input placeholder="Teléfono de contacto" value={form.telefono_contacto} onChange={set('telefono_contacto')} />
                <Textarea placeholder="Dirección exacta de entrega" value={form.direccion} onChange={set('direccion')} rows={2} />
                <Box borderRadius="8px" overflow="hidden" h="220px">
                  <MapaPicker
                    onSelect={(coords) => setForm((f) => ({ ...f, coordenadas: coords, direccion: f.direccion || coords.direccion }))}
                  />
                </Box>
                <Text fontSize="sm" color="gray.500">
                  Costo estimado: ${TARIFAS_DELIVERY[form.ciudad]}
                </Text>
              </>
            )}

            {tipo === 'envio_nacional' && (
              <>
                <Select placeholder="Selecciona la agencia" value={form.agencia_preferida} onChange={set('agencia_preferida')}>
                  {AGENCIAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
                <Input placeholder="Estado" value={form.estado} onChange={set('estado')} />
                <Input placeholder="Ciudad" value={form.ciudad} onChange={set('ciudad')} />
                <Input placeholder="Nombre de quien recibe" value={form.nombre} onChange={set('nombre')} />
                <Input placeholder="Cédula" value={form.cedula} onChange={set('cedula')} />
                <Input placeholder="Teléfono" value={form.telefono_contacto} onChange={set('telefono_contacto')} />
                <Textarea placeholder="Dirección de la agencia o destino" value={form.direccion} onChange={set('direccion')} rows={2} />
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button colorScheme="blue" onClick={handleGuardar} isLoading={guardando}>
            Confirmar dirección
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AgregarDireccionModal