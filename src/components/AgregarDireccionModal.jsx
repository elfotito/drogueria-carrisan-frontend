import { useState } from 'react'
import {
  Dialog, Portal, Button, Input, NativeSelect, Textarea, VStack, Box, Text,
} from '@chakra-ui/react'
import { toaster } from './ui/toaster' // 🆕 generado por el CLI snippet (ver nota abajo)
import MapaPicker from './MapaPicker'

const TARIFAS_DELIVERY = {
  Valencia: 3, Naguanagua: 4, 'San Diego': 5, Guacara: 5, 'Los Guayos': 5,
}
const AGENCIAS = ['MRW', 'Domesa', 'Tealca', 'Zoom']

function AgregarDireccionModal({ isOpen, onClose, tipo, guardarDireccion, onGuardada }) {
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

      const nueva = await guardarDireccion(payload)
      toaster.create({ title: 'Dirección guardada', type: 'success', duration: 2500 })
      onGuardada?.(nueva)
      onClose()
    } catch (err) {
      toaster.create({ title: 'No se pudo guardar la dirección', type: 'error', duration: 3000 })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog.Root
  open={isOpen}
  onOpenChange={(e) => { if (!e.open) onClose() }}
  size={{ base: 'full', md: 'lg' }}
  placement="center"
  closeOnInteractOutside={false}   // 🆕 ¿está esta línea?
>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content
        maxH={{ base: '100dvh', md: '85vh' }}
        borderRadius={{ base: 0, md: '16px' }}
        display="flex"            // 🆕 ¿está esta línea?
        flexDirection="column"    // 🆕
        overflow="hidden"         // 🆕
      >
        <Dialog.Header flexShrink={0}>...</Dialog.Header>
        <Dialog.Body overflowY="auto" flex="1">
        
    
              <Dialog.Title>
                {tipo === 'delivery' ? 'Agregar dirección de delivery' : 'Agregar destino de envío nacional'}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="stretch">
                {tipo === 'delivery' && (
                  <>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={form.ciudad} onChange={set('ciudad')}>
                        {Object.keys(TARIFAS_DELIVERY).map((c) => (
                          <option key={c} value={c}>{c} - ${TARIFAS_DELIVERY[c]}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>

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
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        placeholder="Selecciona la agencia"
                        value={form.agencia_preferida}
                        onChange={set('agencia_preferida')}
                      >
                        {AGENCIAS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>

                    <Input placeholder="Estado" value={form.estado} onChange={set('estado')} />
                    <Input placeholder="Ciudad" value={form.ciudad} onChange={set('ciudad')} />
                    <Input placeholder="Nombre de quien recibe" value={form.nombre} onChange={set('nombre')} />
                    <Input placeholder="Cédula" value={form.cedula} onChange={set('cedula')} />
                    <Input placeholder="Teléfono" value={form.telefono_contacto} onChange={set('telefono_contacto')} />
                    <Textarea placeholder="Dirección de la agencia o destino" value={form.direccion} onChange={set('direccion')} rows={2} />
                  </>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button colorPalette="blue" onClick={handleGuardar} loading={guardando}>
                Confirmar dirección
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
  )
}

export default AgregarDireccionModal