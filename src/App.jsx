import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// SafeIcon component for Lucide icons
const iconMap = {}

const SafeIcon = ({ name, size = 24, className = '', ...props }) => {
  const [Icon, setIcon] = useState(null)
  
  useEffect(() => {
    const loadIcon = async () => {
      if (iconMap[name]) {
        setIcon(() => iconMap[name])
        return
      }
      try {
        const lucide = await import('lucide-react')
        const iconName = name.split('-').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('')
        const IconComponent = lucide[iconName] || lucide.HelpCircle
        iconMap[name] = IconComponent
        setIcon(() => IconComponent)
      } catch {
        const { HelpCircle } = await import('lucide-react')
        setIcon(() => HelpCircle)
      }
    }
    loadIcon()
  }, [name])
  
  if (!Icon) return <div style={{ width: size, height: size }} className={className} />
  
  return <Icon size={size} className={className} {...props} />
}

// Utility for tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Custom Cursor Component
const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const cursorX = useSpring(0, { stiffness: 500, damping: 28 })
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 })
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    if (isMobile) return
    
    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover]')) {
        setIsHovering(true)
      }
    }
    
    const handleMouseOut = () => {
      setIsHovering(false)
    }
    
    window.addEventListener('mousemove', moveCursor)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [cursorX, cursorY, isMobile])
  
  if (isMobile) return null
  
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        className="bg-white rounded-full"
        animate={{
          width: isHovering ? 32 : 8,
          height: isHovering ? 32 : 8,
          opacity: isHovering ? 0.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </motion.div>
  )
}

// Header Component with scroll inversion
const Header = ({ isInverted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex justify-between items-center transition-colors duration-500",
        isInverted ? "text-black" : "text-white"
      )}
    >
      <div className="font-black text-xl tracking-tighter">STUDIO</div>
      
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-12 h-12 flex items-center justify-center"
        data-cursor-hover
      >
        <SafeIcon name={isMenuOpen ? "x" : "menu"} size={24} />
      </button>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-40 flex flex-col items-center justify-center",
              isInverted ? "bg-white" : "bg-black"
            )}
          >
            <nav className="flex flex-col items-center gap-8">
              {['Projects', 'Services', 'About', 'Contact'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-black text-5xl md:text-7xl tracking-tighter hover:opacity-50 transition-opacity"
                  data-cursor-hover
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// Hero Section
const Hero = () => {
  return (
    <section className="relative h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <motion.h1 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-black text-[12vw] md:text-[10vw] tracking-tighter leading-tight text-center"
      >
        DESIGNING
        <br />
        SILENCE
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <SafeIcon name="arrow-down" size={24} />
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-12 right-6 md:right-12 font-mono text-xs">
        <span className="opacity-50">01</span> / 04
      </div>
    </section>
  )
}

// Image Reveal Component
const ImageReveal = ({ src, alt, className, delay = 0 }) => {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        <img 
          src={src} 
          alt={alt} 
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 0 }}
        animate={isInView ? { y: '100%' } : {}}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-white"
      />
    </div>
  )
}

// Projects Gallery Section
const ProjectsGallery = () => {
  const projects = [
    {
      id: 1,
      title: "Minimal Residence",
      year: "2024",
      location: "Tokyo, Japan",
      size: "340 m²",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
      layout: "full"
    },
    {
      id: 2,
      title: "Void Gallery",
      year: "2023",
      location: "Berlin, Germany",
      size: "280 m²",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
      layout: "right"
    },
    {
      id: 3,
      title: "Concrete Chapel",
      year: "2023",
      location: "Oslo, Norway",
      size: "520 m²",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      layout: "full"
    },
    {
      id: 4,
      title: "Light Pavilion",
      year: "2022",
      location: "Copenhagen, Denmark",
      size: "180 m²",
      image: "https://images.unsplash.com/photo-1600573472591-ee6c563aaec9?w=1200&q=80",
      layout: "right"
    }
  ]
  
  return (
    <section id="projects" className="bg-white text-black py-[20vh] px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto space-y-[15vh]">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-20"
        >
          <h2 className="font-black text-[8vw] md:text-[5vw] tracking-tighter leading-tight">
            Selected
            <br />
            Projects
          </h2>
          <span className="font-mono text-xs opacity-50">02 / 04</span>
        </motion.div>
        
        {projects.map((project, index) => (
          <div 
            key={project.id}
            className={cn(
              "grid grid-cols-12 gap-4 items-end",
              project.layout === "full" ? "w-full" : "ml-auto w-full md:w-2/3"
            )}
          >
            <div 
              className={cn(
                project.layout === "full" ? "col-span-12" : "col-span-12 md:col-span-8 md:col-start-5"
              )}
            >
              <ImageReveal
                src={project.image}
                alt={project.title}
                className="aspect-[16/10] w-full"
                delay={0.1}
              />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={cn(
                "col-span-12 flex justify-between items-start mt-4",
                project.layout === "full" ? "" : "md:col-span-3 md:col-start-1 md:row-start-1 md:sticky md:bottom-0"
              )}
            >
              <div>
                <h3 className="font-black text-2xl md:text-3xl tracking-tighter mb-2">
                  {project.title}
                </h3>
                <p className="font-mono text-xs opacity-50">{project.location}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs opacity-50">{project.year}</p>
                <p className="font-mono text-xs opacity-50">{project.size}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Services Section
const Services = () => {
  const [activeService, setActiveService] = useState(null)
  
  const services = [
    {
      id: 1,
      title: "Architecture",
      description: "Complete architectural design from concept to completion",
      image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
      details: ["Concept Development", "Technical Drawings", "3D Visualization", "Construction Supervision"]
    },
    {
      id: 2,
      title: "Interior Design",
      description: "Spatial planning and interior architecture",
      image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80",
      details: ["Space Planning", "Material Selection", "Custom Furniture", "Lighting Design"]
    },
    {
      id: 3,
      title: "Master Planning",
      description: "Urban scale developments and landscape integration",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      details: ["Site Analysis", "Urban Strategy", "Landscape Design", "Sustainability Consulting"]
    },
    {
      id: 4,
      title: "Consultation",
      description: "Expert advisory for complex projects",
      image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
      details: ["Feasibility Studies", "Design Review", "Project Management", "Cost Analysis"]
    }
  ]
  
  return (
    <section id="services" className="bg-black text-white py-[20vh] px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-20"
        >
          <h2 className="font-black text-[8vw] md:text-[5vw] tracking-tighter leading-tight">
            Our
            <br />
            Services
          </h2>
          <span className="font-mono text-xs opacity-50">03 / 04</span>
        </motion.div>
        
        <div className="space-y-0">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-t border-white/20 py-8 md:py-12 group relative"
              onMouseEnter={() => setActiveService(service.id)}
              onMouseLeave={() => setActiveService(null)}
              data-cursor-hover
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs opacity-50">0{index + 1}</span>
                  <h3 className="font-black text-4xl md:text-6xl tracking-tighter group-hover:translate-x-4 transition-transform duration-500">
                    {service.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-6 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-mono text-xs opacity-70 hidden md:block">{service.description}</p>
                  <SafeIcon name="arrow-up-right" size={32} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
              
              {/* Hover Preview Image */}
              <AnimatePresence>
                {activeService === service.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="hidden md:block absolute right-24 top-1/2 -translate-y-1/2 w-64 h-48 pointer-events-none z-10"
                  >
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover grayscale"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          <div className="border-t border-white/20" />
        </div>
      </div>
    </section>
  )
}

// Footer Section
const Footer = () => {
  return (
    <footer id="contact" className="bg-white text-black py-[20vh] px-6 md:px-12 pb-[120px]">
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-between items-start mb-20"
        >
          <span className="font-mono text-xs opacity-50">04 / 04</span>
          <span className="font-mono text-xs opacity-50">Get in Touch</span>
        </motion.div>
        
        <motion.a
          href="mailto:hello@studio.com"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="block font-black text-[10vw] md:text-[8vw] tracking-tighter leading-tight hover:opacity-50 transition-opacity break-all"
          data-cursor-hover
        >
          HELLO@
          <br />
          STUDIO.COM
        </motion.a>
        
        <div className="grid grid-cols-12 gap-8 mt-20 pt-12 border-t border-black/10">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono text-xs opacity-50 mb-2">Location</p>
            <p className="font-medium">Berlin, Germany</p>
            <p className="font-medium">Tokyo, Japan</p>
          </div>
          
          <div className="col-span-6 md:col-span-4">
            <p className="font-mono text-xs opacity-50 mb-2">Social</p>
            <div className="space-y-1">
              <a href="#" className="block font-medium hover:opacity-50 transition-opacity" data-cursor-hover>Instagram</a>
              <a href="#" className="block font-medium hover:opacity-50 transition-opacity" data-cursor-hover>LinkedIn</a>
              <a href="#" className="block font-medium hover:opacity-50 transition-opacity" data-cursor-hover>Behance</a>
            </div>
          </div>
          
          <div className="col-span-6 md:col-span-4 text-right">
            <p className="font-mono text-xs opacity-50 mb-2">© 2024</p>
            <p className="font-medium">STUDIO</p>
            <p className="font-mono text-xs opacity-50 mt-2">All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main App Component
function App() {
  const { scrollYProgress } = useScroll()
  const [isInverted, setIsInverted] = useState(false)
  
  // Track scroll position for color inversion
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      
      // Invert based on which section is dominant
      // Hero (black) = 0-100vh, Projects (white) = 100vh-300vh, Services (black) = 300vh-400vh, Footer (white) = 400vh+
      if ((scrollY > viewportHeight * 0.8 && scrollY < viewportHeight * 3) || 
          scrollY > viewportHeight * 4) {
        setIsInverted(true)
      } else {
        setIsInverted(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="relative">
      <CustomCursor />
      <Header isInverted={isInverted} />
      
      <main>
        <Hero />
        <ProjectsGallery />
        <Services />
        <Footer />
      </main>
    </div>
  )
}

export default App