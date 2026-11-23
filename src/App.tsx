import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { Github, MessageSquare, Mail, ExternalLink, Hash } from "lucide-react";

const links = [
  {
    name: "GitHub",
    label: "retrilzzy",
    url: "https://github.com/retrilzzy",
    icon: <Github className="w-5 h-5" />,
  },
  {
    name: "Matrix",
    label: "@retrilz:matrix.org",
    url: "https://matrix.to/#/@retrilz:matrix.org",
    icon: <Hash className="w-5 h-5" />,
  },
  {
    name: "Discord",
    label: "retrilzzy",
    url: "https://discord.com/users/613636431532785664",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Email",
    label: "retrilz@proton.me",
    url: "mailto:retrilz@proton.me",
    icon: <Mail className="w-5 h-5" />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const titleLetterVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.3, ease: [0.5, 1, 0.3, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const isTouchingRef = useRef(false);
  const spotlightLayerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const gridX = useSpring(rawX, { stiffness: 120, damping: 25, mass: 0.5 });
  const gridY = useSpring(rawY, { stiffness: 120, damping: 25, mass: 0.5 });

  useEffect(() => {
    const spotlightEl = spotlightLayerRef.current;
    if (!spotlightEl) return;

    let rect = spotlightEl.getBoundingClientRect();
    const resizeObserver = new ResizeObserver(() => {
      rect = spotlightEl.getBoundingClientRect();
    });
    resizeObserver.observe(spotlightEl);

    const handleMouseSpotlight = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || rect.width === 0 || rect.height === 0) {
        return;
      }
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlightEl.style.setProperty("--mouse-x", `${x}%`);
      spotlightEl.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("pointermove", handleMouseSpotlight, {
      passive: true,
    });
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handleMouseSpotlight);
    };
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const maxOffset = 24;
    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const updateFromPointer = (clientX: number, clientY: number) => {
      const nx = (clientX / window.innerWidth - 0.5) * 2;
      const ny = (clientY / window.innerHeight - 0.5) * 2;
      rawX.set(-nx * maxOffset);
      rawY.set(-ny * maxOffset);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      isTouchingRef.current = true;
      updateFromPointer(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !isTouchingRef.current) return;
      updateFromPointer(e.clientX, e.clientY);
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      isTouchingRef.current = false;
      rawX.set(0);
      rawY.set(0);
    };

    const handlePointerLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (isTouchingRef.current || e.gamma === null || e.beta === null) return;
      const nx = clamp(e.gamma / 30, -1, 1);
      const ny = clamp((e.beta - 45) / 30, -1, 1);
      rawX.set(-nx * maxOffset);
      rawY.set(-ny * maxOffset);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerEnd, { passive: true });
    window.addEventListener("pointercancel", handlePointerEnd, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("deviceorientation", handleDeviceOrientation, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [shouldReduceMotion, rawX, rawY]);

  return (
    <div className="min-h-screen atmosphere spotlight-scope flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          style={shouldReduceMotion ? undefined : { x: gridX, y: gridY }}
          className="absolute -inset-15 bg-grid"
        >
          <div
            ref={spotlightLayerRef}
            className="absolute inset-0 bg-grid-spotlight"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.6,
            x: [0, 80, 0],
            y: [0, 40, 0],
          }}
          transition={{
            opacity: { duration: 2 },
            x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/15 blur-[100px] rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.6,
            x: [0, -80, 0],
            y: [0, -40, 0],
          }}
          transition={{
            opacity: { duration: 2, delay: 0.5 },
            x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/15 blur-[100px] rounded-full"
        />
      </div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl z-10 py-12"
      >
        <header className="mb-8 md:mb-12 text-center md:text-left px-4">
          <motion.h1 className="text-6xl sm:text-8xl md:text-9xl font-light tracking-tighter mb-4 leading-none flex flex-wrap justify-center md:justify-start">
            {"Retrilz".split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={titleLetterVariants}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, delay: 1 },
              },
            }}
            className="text-muted text-lg sm:text-xl md:text-2xl font-light max-w-md mx-auto md:mx-3"
          >
            Hii! Nice to meet you!
          </motion.p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {links.map((link) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              className="glass p-5 md:p-7 rounded-3xl flex flex-col justify-between group link-hover relative overflow-hidden h-38 md:h-44 focus-visible:outline-2 focus-visible:outline-white/80 focus-visible:outline-offset-3"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 group-active:bg-white/10 transition-colors">
                  {link.icon}
                </div>
                <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100 group-active:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 group-active:translate-y-0" />
              </div>

              <div>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted group-hover:text-white/60 group-active:text-white/60 transition-colors mb-1 font-semibold">
                  {link.name}
                </span>
                <span className="block text-xl md:text-2xl font-light tracking-tight truncate">
                  {link.label}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/20 group-hover:w-full group-active:w-full transition-all duration-500" />
            </motion.a>
          ))}
        </div>
      </motion.main>
    </div>
  );
}
