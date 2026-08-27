import { useAuth } from '../context/AuthContext'
import DashboardMobile from '../components/DashboardMobile'
import CookieConsent from '../components/CookieConsent'


function Home() {
  const { user } = useAuth()

  return <DashboardMobile user={user} />
      {user && <CookieConsent />}
}

export default Home
