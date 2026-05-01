import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { navLinks } from "../../data/constants";
import { Logo } from "../ui";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) {
      onClose();
      return;
    }

    event.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 flex flex-col p-8 bg-brand-blue/45 backdrop-blur-2xl border-l border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
        >
          <div className="flex justify-between items-center mb-16">
            <Logo />
            <button
              onClick={onClose}
              aria-label="Close mobile menu"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-6 mb-auto">
            {navLinks.map((link, idx) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                onClick={(event) => handleNavClick(event, link.href)}
                className="text-3xl font-light tracking-tight hover:text-brand-teal transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-8">
            <Link
              to="/signup"
              onClick={onClose}
              className="w-full py-4 rounded-full bg-brand-teal text-white font-semibold text-xs uppercase tracking-[0.2em] hover:bg-brand-teal/90 transition-colors text-center"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              onClick={onClose}
              className="w-full py-4 rounded-full border border-white/35 bg-white/5 hover:bg-white/15 transition-colors text-xs font-semibold uppercase tracking-[0.2em] text-center"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
