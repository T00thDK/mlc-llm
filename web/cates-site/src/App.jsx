import Nav from './components/Nav'
import Hero from './components/Hero'
import Notes from './components/Notes'
import Work from './components/Work'
import Reading from './components/Reading'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Notes />
        <Work />
        <Reading />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
