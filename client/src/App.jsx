import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ApartmentDetail from './pages/ApartmentDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import AddApartment from './pages/AddApartment'
import Profile from './pages/Profile'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartments/:id" element={<ApartmentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add" element={<AddApartment />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </>
  )
}
