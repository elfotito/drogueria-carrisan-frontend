import { useAuth } from '../context/AuthContext'
import DashboardMobile from '../components/DashboardMobile'

function Home() {
  const { user } = useAuth()

  return <DashboardMobile user={user} />
}

export default Home
