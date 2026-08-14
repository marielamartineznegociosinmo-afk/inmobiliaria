import { motion } from "framer-motion";

interface AboutHeroProps {
  title: React.ReactNode;
  subtitle: string;
  image?: string;
}

export function AboutHero({ title, subtitle, image }: AboutHeroProps) {
  return (
    <section className="relative min-h-[38vh] flex items-center py-16 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[#1A3A6B]">
        {image ? (
          <>
            {/* Misma receta de degradado azul que el hero del home: la foto de
                fondo, un teñido en el color primario del sitio encima, y un
                desvanecido hacia abajo para que el texto siga siendo legible. */}
            <img src={image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3A6B] via-[#1A3A6B]/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] select-none pointer-events-none">
            <svg viewBox="0 0 200 200" fill="white" className="w-[60vw] max-w-2xl"><path d="M100 20 L170 80 L170 170 L130 170 L130 120 L70 120 L70 170 L30 170 L30 80 Z"/></svg>
          </div>
        )}
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg text-white/90 font-light leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
