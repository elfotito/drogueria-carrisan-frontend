
import { 
  Box, 
  Paper, 
  Typography, 
  Radio, 
  Button,
  Chip 
} from '@mui/material';
import { useEnvio } from './useEnvios

export const SelectorEnvio = () => {
  const { 
    tipoEnvio, 
    cambiarTipoEnvio, 
    opcionesEnvio 
  } = useEnvio();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        ¿Cómo quieres recibir tu pedido?
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {opcionesEnvio.map((opcion) => (
          <Paper
            key={opcion.id}
            elevation={tipoEnvio === opcion.id ? 3 : 1}
            sx={{
              p: 2.5,
              cursor: 'pointer',
              border: '2px solid',
              borderColor: tipoEnvio === opcion.id ? 'primary.main' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.light',
                transform: 'translateX(4px)'
              }
            }}
            onClick={() => cambiarTipoEnvio(opcion.id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Radio checked={tipoEnvio === opcion.id} />
              
              <Box sx={{ fontSize: '2rem' }}>{opcion.icono}</Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {opcion.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {opcion.descripcion}
                </Typography>
              </Box>
              
              <Chip 
                label={opcion.textoCosto}
                color={opcion.costo === 0 ? 'success' : 'primary'}
                variant="filled"
                size="small"
              />
            </Box>
            
            {/* Expandir si está seleccionado y requiere dirección */}
            {tipoEnvio === opcion.id && opcion.requiereDireccion && (
              <Box sx={{ mt: 2, pl: 6 }}>
                {opcion.id === 'delivery' && <SelectorDireccionDelivery />}
                {opcion.id === 'envio_nacional' && <SelectorDireccionNacional />}
              </Box>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};
