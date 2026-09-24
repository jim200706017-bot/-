import { Routes, Route } from 'react-router'
import { AuthProvider } from '@/lib/auth'
import { ContentProvider } from '@/lib/content'
import { QaProvider } from '@/lib/qa'
import Home from '@/pages/Home'
import Intro from '@/pages/Intro'
import Admin from '@/pages/Admin'
import EventsPage from '@/pages/EventsPage'
import PlatformsPage from '@/pages/PlatformsPage'
import ContactPage from '@/pages/ContactPage'
import FaqPage from '@/pages/FaqPage'
import QaPage from '@/pages/QaPage'

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <QaProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/platforms" element={<PlatformsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/qa" element={<QaPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </QaProvider>
      </ContentProvider>
    </AuthProvider>
  )
}
