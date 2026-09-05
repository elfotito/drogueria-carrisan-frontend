import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Field,
  Flex,
  Heading,
  Input,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ShieldCheck, ClipboardCheck, Truck, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import TurnstileWidget from '../../components/registro/TurnstileWidget'
import { validarEmail, validarPassword } from '../../utils/validadores'
import { useStaffAuth } from '../../context/StaffAuthContext'
import api from '../../api/axios'
import staffApi from '../../api/staffAxios'
import logo from '../../assets/minilogo color sin fondo.png'
import logoBlanco from '../../assets/minilogo blanco sin fondo.png'
import hero from '../../assets/hero.png'

/* Paleta de marca */
const AZUL_OSCURO = '#1B4B8F'
const TEAL = '#12A594'
const AZUL_PRINCIPAL = '#0052DC'
const GRIS_OSCURO = '#232B45'

/* Puntos destacados del panel de branding (desktop) */
const PANEL_FEATURES = [
  { icon: ClipboardCheck, texto: 'Pedidos, aprobaciones y despachos' },
  { icon: Truck, texto: 'Contabilidad, facturación y cobranza' },
  { icon: ShieldCheck, texto: 'Acceso seguro por rol y departamento' },
]

const ROLES_STAFF = {
  vendedor: 'Vendedor',
  despachador: 'Despachador',
  almacenista: 'Almacenista',
  contabilidad: 'Contabilidad',
  administrador: 'Administrador',
  director: 'Director',
  admin: 'Administrador',
}

function FondoFormulario({ children }) {
  return (
    <Flex
      flex="1"
      flexDirection="column"
      alignItems="center"
      position="relative"
      p={{ base: 4, md: 8 }}
      minH="100dvh"
      overflowY="auto"
      bg={{
        base: 'linear-gradient(160deg, #1B4B8F 0%, #14407A 52%, #12A594 100%)',
        lg: '#F2F5FA',
      }}
    >
      {/* Glows decorativos sobre el fondo */}
      <Box
        aria-hidden="true"
        position="absolute"
        top="-100px"
        right="-100px"
        w="300px"
        h="300px"
        rounded="full"
        bg="whiteAlpha.200"
        filter="blur(70px)"
        pointerEvents="none"
        display={{ lg: 'none' }}
      />
      <Box
        aria-hidden="true"
        position="absolute"
        bottom="-140px"
        left="-140px"
        w="360px"
        h="360px"
        rounded="full"
        bg="teal.200"
        opacity="0.25"
        filter="blur(90px)"
        pointerEvents="none"
      />
      {children}
    </Flex>
  )
}

function StaffRegistro() {
  const navigate = useNavigate()
  const { iniciarSesionConDatos } = useStaffAuth()

  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [codigoValido, setCodigoValido] = useState(false)
  const [rolAsignado, setRolAsignado] = useState(null)
  const [errorCodigo, setErrorCodigo] = useState('')

  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  function calcularFuerzaPassword(pw) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { width: '20%', color: '#e53e3e', label: 'Débil' }
    if (score <= 3) return { width: '60%', color: '#dd6b20', label: 'Media' }
    if (score === 4) return { width: '80%', color: '#38a169', label: 'Fuerte' }
    return { width: '100%', color: '#276749', label: 'Muy fuerte' }
  }

  async function verificarCodigo(e) {
    e.preventDefault()
    const limpio = codigo.trim().toUpperCase()
    if (!limpio) {
      setErrorCodigo('Ingresa tu código de invitación')
      return
    }

    setErrorCodigo('')
    setVerificando(true)
    try {
      const { data } = await api.post('/auth/verificar-codigo', { codigo: limpio, tipo: 'staff' })
      setCodigoValido(true)
      setRolAsignado(data.rol_staff || null)
    } catch (err) {
      setErrorCodigo(err.response?.data?.error || 'No se pudo verificar el código')
    } finally {
      setVerificando(false)
    }
  }

  function volverAlCodigo() {
    setCodigoValido(false)
    setRolAsignado(null)
    setErrorGeneral('')
  }

  function validarFormulario() {
    const nuevosErrores = {}
    if (!validarEmail(email)) nuevosErrores.email = 'Ingresa un correo válido'
    if (!nombre.trim()) nuevosErrores.nombre = 'Campo requerido'
    const pwCheck = validarPassword(password)
    if (!pwCheck.valido) nuevosErrores.password = pwCheck.error
    if (password !== confirmarPassword) nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden'
    if (!turnstileToken) nuevosErrores.turnstile = 'Completa la verificación de seguridad'
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    if (!validarFormulario()) {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setCargando(true)
    try {
      const { data } = await staffApi.post('/staff/registro', {
        email: email.trim().toLowerCase(),
        nombre: nombre.trim(),
        password,
        codigo: codigo.trim().toUpperCase(),
        turnstileToken,
      })
      // Auto-login: el backend devuelve token + staff, igual que /staff/login.
      iniciarSesionConDatos(data)
      navigate('/staff/dashboard')
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || 'No se pudo completar el registro. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const fuerzaPassword = calcularFuerzaPassword(password)

  const panelBranding = (
    <Box
      display={{ base: 'none', lg: 'flex' }}
      flex="1"
      flexDirection="column"
      bgGradient="to-br"
      gradientFrom={AZUL_OSCURO}
      gradientTo={TEAL}
      color="white"
      px={{ lg: 14, xl: 20 }}
      py={{ lg: 10, xl: 14 }}
      position="relative"
      overflowY="auto"
    >
      {/* Glow decorativo */}
      <Box
        aria-hidden="true"
        position="absolute"
        top="-120px"
        right="-120px"
        w="380px"
        h="380px"
        rounded="full"
        bg="whiteAlpha.200"
        filter="blur(80px)"
        pointerEvents="none"
      />

      {/* Marca */}
      <Flex align="center" gap={3}>
        <Box bg="whiteAlpha.200" p={2} rounded="xl" lineHeight="0">
          <img src={logoBlanco} alt="Drogueria Carrisan" style={{ height: 34 }} />
        </Box>
        <Box>
          <Text fontWeight="800" fontSize="lg" lineHeight="1.1">
            Drogueria Carrisan
          </Text>
          <Text fontSize="xs" color="whiteAlpha.700">
            Plataforma interna del personal
          </Text>
        </Box>
      </Flex>

      {/* Mensaje + features + imagen */}
      <Box flex="1" maxW="460px" my={{ lg: 8, xl: 10 }}>
        <Text
          fontSize="xs"
          fontWeight="700"
          letterSpacing="2px"
          textTransform="uppercase"
          color="whiteAlpha.700"
        >
          Panel B2B farmacéutico
        </Text>
        <Heading as="h2" size="2xl" fontWeight="800" mt={3} lineHeight="1.15">
          Tu jornada de trabajo, en un solo lugar
        </Heading>
        <Text mt={3} fontSize="sm" color="whiteAlpha.800">
          Gestioná pedidos, aprobaciones de almacén, despachos y finanzas desde una única
          plataforma segura.
        </Text>

        <Stack mt={6} gap={2.5}>
          {PANEL_FEATURES.map(({ icon: Icono, texto }) => (
            <Flex key={texto} align="center" gap={2.5} color="whiteAlpha.900">
              <Box
                as="span"
                display="inline-flex"
                p={1.5}
                rounded="lg"
                bg="whiteAlpha.200"
                color="white"
              >
                <Icono size={15} />
              </Box>
              <Text fontSize="sm">{texto}</Text>
            </Flex>
          ))}
        </Stack>

        <Box
          mt={8}
          rounded="2xl"
          overflow="hidden"
          border="1px solid"
          borderColor="whiteAlpha.300"
          shadow="dark-lg"
        >
          {/* IMAGEN: hero.png como foto decorativa del sector farmacéutico.
              Si querés otra, reemplazá la importación o la ruta src={hero}. */}
          <img
            src={hero}
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
          />
        </Box>
      </Box>

      <Text fontSize="xs" color="whiteAlpha.600">
        © 2026 Drogueria Carrisan · Valencia, Venezuela
      </Text>
    </Box>
  )

  const pieCard = (
    <>
      <Separator borderColor="gray.100" />
      <Box textAlign="center" fontSize="sm" color="gray.500">
        ¿Ya tenés acceso?{' '}
        <Link to="/staff/login" style={{ color: AZUL_PRINCIPAL, fontWeight: 600 }}>
          Iniciá sesión
        </Link>
      </Box>
      <Flex align="center" justify="center" gap={1.5} color="gray.400" fontSize="xs">
        <Lock size={12} aria-hidden="true" />
        <Text>Acceso restringido · Uso interno — Drogueria Carrisan</Text>
      </Flex>
    </>
  )

  if (!codigoValido) {
    return (
      <Flex minH="100dvh" w="100%">
        {panelBranding}
        <FondoFormulario>
          <Card.Root
            w="100%"
            maxW="md"
            bg="white"
            rounded="2xl"
            my="auto"
            boxShadow={{
              base: '0 24px 48px rgba(2, 12, 32, 0.30)',
              md: '0 20px 50px rgba(35, 43, 69, 0.10)',
            }}
            border={{ lg: '1px solid' }}
            borderColor={{ lg: 'gray.100' }}
          >
            <Card.Body p={{ base: 6, md: 8 }} display="flex" flexDirection="column" gap={5}>
              {/* Logo (se mantiene el enlace original) */}
              <Flex justify="center">
                <Link to="/staff/login" aria-label="Ir al panel del personal">
                  <img
                    src={logo}
                    alt="Drogueria Carrisan"
                    style={{ height: 44, width: 'auto', objectFit: 'contain' }}
                  />
                </Link>
              </Flex>

              {/* Título y subtítulo */}
              <Box textAlign="center">
                <Heading as="h1" size="lg" fontWeight="800" color={GRIS_OSCURO}>
                  Código de invitación
                </Heading>
                <Text mt={1.5} fontSize="sm" color="gray.500">
                  El registro de personal es exclusivo para quienes tienen un código
                  generado por la administración. Ingresa el código que te compartieron.
                </Text>
              </Box>

              {/* Aviso informativo */}
              <Flex
                gap={2.5}
                p={3}
                rounded="lg"
                bg="teal.50"
                border="1px solid"
                borderColor="teal.200"
              >
                <Box color={TEAL} flexShrink={0} mt="1px">
                  <KeyRound size={16} />
                </Box>
                <Text fontSize="sm" color="gray.600">
                  El código es personal e intransferible. Si no tenés uno, solicitá el
                  acceso con tu líder o con la administración.
                </Text>
              </Flex>

              {/* Formulario */}
              <form onSubmit={verificarCodigo}>
                <Stack gap={4}>
                  <Field.Root required invalid={!!errorCodigo}>
                    <Field.Label
                      htmlFor="codigo"
                      fontSize="sm"
                      fontWeight="600"
                      color={GRIS_OSCURO}
                    >
                      Código de invitación <Field.RequiredIndicator color="red.400" />
                    </Field.Label>
                    <Input
                      id="codigo"
                      size="lg"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      placeholder="Ej: ABC123"
                      autoFocus
                      bg="white"
                      borderColor="gray.200"
                      invalid={!!errorCodigo}
                      _focus={{ borderColor: AZUL_PRINCIPAL, boxShadow: `0 0 0 1px ${AZUL_PRINCIPAL}` }}
                    />
                    {errorCodigo && (
                      <Field.ErrorText fontSize="sm" role="alert">
                        {errorCodigo}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Button
                    type="submit"
                    w="100%"
                    size="lg"
                    mt={1}
                    bg={AZUL_PRINCIPAL}
                    color="white"
                    fontWeight="700"
                    _hover={{ bg: '#0041B0' }}
                    _active={{ bg: '#003A9E' }}
                    loading={verificando}
                    loadingText="Verificando..."
                  >
                    Verificar código
                  </Button>
                </Stack>
              </form>

              {pieCard}
            </Card.Body>
          </Card.Root>
        </FondoFormulario>
      </Flex>
    )
  }

  return (
    <Flex minH="100dvh" w="100%">
      {panelBranding}
      <FondoFormulario>
        <Card.Root
          w="100%"
          maxW="md"
          bg="white"
          rounded="2xl"
          my="auto"
          boxShadow={{
            base: '0 24px 48px rgba(2, 12, 32, 0.30)',
            md: '0 20px 50px rgba(35, 43, 69, 0.10)',
          }}
          border={{ lg: '1px solid' }}
          borderColor={{ lg: 'gray.100' }}
        >
          <Card.Body p={{ base: 6, md: 8 }} display="flex" flexDirection="column" gap={5}>
            {/* Logo (se mantiene el enlace original) */}
            <Flex justify="center">
              <Link to="/staff/login" aria-label="Ir al panel del personal">
                <img
                  src={logo}
                  alt="Drogueria Carrisan"
                  style={{ height: 44, width: 'auto', objectFit: 'contain' }}
                />
              </Link>
            </Flex>

            {/* Título y subtítulo */}
            <Box textAlign="center">
              <Heading as="h1" size="lg" fontWeight="800" color={GRIS_OSCURO}>
                Completa tu registro
              </Heading>
              <Text mt={1.5} fontSize="sm" color="gray.500">
                Código verificado — ya podés completar tus datos
              </Text>
            </Box>

            {/* Rol asignado */}
            <Flex
              align="center"
              justify="space-between"
              gap={3}
              p={3}
              rounded="lg"
              bg="teal.50"
              border="1px solid"
              borderColor="teal.200"
            >
              <Flex align="center" gap={2.5} minW="0">
                <Badge
                  bg={TEAL}
                  color="white"
                  rounded="md"
                  px={2.5}
                  py={1}
                  fontWeight="700"
                  textTransform="none"
                  fontSize="xs"
                  flexShrink={0}
                >
                  {ROLES_STAFF[rolAsignado] || rolAsignado || 'Personal'}
                </Badge>
                <Text fontSize="sm" color="gray.600" isTruncated>
                  Rol asignado
                </Text>
              </Flex>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={volverAlCodigo}
                color={AZUL_PRINCIPAL}
                fontWeight="600"
                flexShrink={0}
                px={2}
              >
                Cambiar código
              </Button>
            </Flex>

            {/* Error general */}
            {errorGeneral && (
              <Alert.Root
                status="error"
                role="alert"
                rounded="lg"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
              >
                <Alert.Indicator color="red.500" />
                <Alert.Content>
                  <Alert.Title fontSize="sm" color="red.700">
                    {errorGeneral}
                  </Alert.Title>
                </Alert.Content>
              </Alert.Root>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate>
              <Stack gap={4}>
                <Field.Root required invalid={!!errores.email}>
                  <Field.Label
                    htmlFor="email"
                    fontSize="sm"
                    fontWeight="600"
                    color={GRIS_OSCURO}
                  >
                    Correo electrónico (para iniciar sesión){' '}
                    <Field.RequiredIndicator color="red.400" />
                  </Field.Label>
                  <Input
                    id="email"
                    type="email"
                    size="lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    bg="white"
                    borderColor="gray.200"
                    invalid={!!errores.email}
                    _focus={{ borderColor: AZUL_PRINCIPAL, boxShadow: `0 0 0 1px ${AZUL_PRINCIPAL}` }}
                  />
                  {errores.email && (
                    <Field.ErrorText fontSize="sm" role="alert">
                      {errores.email}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root required invalid={!!errores.nombre}>
                  <Field.Label
                    htmlFor="nombre"
                    fontSize="sm"
                    fontWeight="600"
                    color={GRIS_OSCURO}
                  >
                    Nombre completo <Field.RequiredIndicator color="red.400" />
                  </Field.Label>
                  <Input
                    id="nombre"
                    size="lg"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    autoComplete="name"
                    placeholder="Ej: María Pérez"
                    bg="white"
                    borderColor="gray.200"
                    invalid={!!errores.nombre}
                    _focus={{ borderColor: AZUL_PRINCIPAL, boxShadow: `0 0 0 1px ${AZUL_PRINCIPAL}` }}
                  />
                  {errores.nombre && (
                    <Field.ErrorText fontSize="sm" role="alert">
                      {errores.nombre}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root required invalid={!!errores.password}>
                  <Field.Label
                    htmlFor="password"
                    fontSize="sm"
                    fontWeight="600"
                    color={GRIS_OSCURO}
                  >
                    Contraseña <Field.RequiredIndicator color="red.400" />
                  </Field.Label>
                  <Box position="relative">
                    <Input
                      id="password"
                      type={mostrarPassword ? 'text' : 'password'}
                      size="lg"
                      pr="3rem"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres con letras y números"
                      bg="white"
                      borderColor="gray.200"
                      invalid={!!errores.password}
                      _focus={{ borderColor: AZUL_PRINCIPAL, boxShadow: `0 0 0 1px ${AZUL_PRINCIPAL}` }}
                    />
                    <Button
                      type="button"
                      onClick={() => setMostrarPassword((v) => !v)}
                      aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      position="absolute"
                      top="50%"
                      right="1"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="sm"
                      color="gray.500"
                      h="auto"
                      p={1}
                      _hover={{ color: AZUL_PRINCIPAL, bg: 'transparent' }}
                    >
                      {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </Box>

                  {password && (
                    <Box mt={2}>
                      <Box h="1.5" rounded="full" bg="gray.100" overflow="hidden">
                        <Box
                          h="100%"
                          rounded="full"
                          style={{ width: fuerzaPassword.width, background: fuerzaPassword.color }}
                        />
                      </Box>
                      <Text
                        fontSize="xs"
                        fontWeight="600"
                        mt={1}
                        color={fuerzaPassword.color}
                        role="status"
                      >
                        {fuerzaPassword.label}
                      </Text>
                    </Box>
                  )}

                  {errores.password && (
                    <Field.ErrorText fontSize="sm" role="alert">
                      {errores.password}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root required invalid={!!errores.confirmarPassword}>
                  <Field.Label
                    htmlFor="confirmarPassword"
                    fontSize="sm"
                    fontWeight="600"
                    color={GRIS_OSCURO}
                  >
                    Confirmar contraseña <Field.RequiredIndicator color="red.400" />
                  </Field.Label>
                  <Box position="relative">
                    <Input
                      id="confirmarPassword"
                      type={mostrarConfirmar ? 'text' : 'password'}
                      size="lg"
                      pr="3rem"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Repite la contraseña"
                      bg="white"
                      borderColor="gray.200"
                      invalid={!!errores.confirmarPassword}
                      _focus={{ borderColor: AZUL_PRINCIPAL, boxShadow: `0 0 0 1px ${AZUL_PRINCIPAL}` }}
                    />
                    <Button
                      type="button"
                      onClick={() => setMostrarConfirmar((v) => !v)}
                      aria-label={mostrarConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      position="absolute"
                      top="50%"
                      right="1"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="sm"
                      color="gray.500"
                      h="auto"
                      p={1}
                      _hover={{ color: AZUL_PRINCIPAL, bg: 'transparent' }}
                    >
                      {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </Box>
                  {errores.confirmarPassword && (
                    <Field.ErrorText fontSize="sm" role="alert">
                      {errores.confirmarPassword}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Box>
                  <Box display="flex" justifyContent="center" mx="auto" mt={1} mb={1}>
                    <TurnstileWidget onVerificado={setTurnstileToken} onExpirado={() => setTurnstileToken('')} />
                  </Box>
                  {errores.turnstile && (
                    <Text fontSize="sm" color="red.600" role="alert">
                      {errores.turnstile}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  w="100%"
                  size="lg"
                  mt={1}
                  bg={AZUL_PRINCIPAL}
                  color="white"
                  fontWeight="700"
                  _hover={{ bg: '#0041B0' }}
                  _active={{ bg: '#003A9E' }}
                  loading={cargando}
                  loadingText="Creando cuenta..."
                >
                  Crear cuenta
                </Button>
              </Stack>
            </form>

            {pieCard}
          </Card.Body>
        </Card.Root>
      </FondoFormulario>
    </Flex>
  )
}

export default StaffRegistro