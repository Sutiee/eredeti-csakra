"use client";

import { motion } from "framer-motion";

type HeroPersonalizedProps = {
  name: string;
};

export default function HeroPersonalized({
  name,
}: HeroPersonalizedProps): JSX.Element {
  return (
    <div className="bg-gradient-to-b from-spiritual-purple-50 to-white py-8">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-serif text-4xl md:text-5xl text-center text-spiritual-purple-900"
        >
          Kedves {name}!
        </motion.h1>
      </div>
    </div>
  );
}
