'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const steps = [
  {
    number: '01',
    title: 'Felfedezés',
    description:
      'A 3 perces kérdőív segítségével feltérképezzük mind a 7 csakrádat, és pontos képet kapunk energiarendszeredről',
    icon: '🔍',
    gradient: 'from-spiritual-purple-400 to-spiritual-purple-600',
  },
  {
    number: '02',
    title: 'Megértés',
    description:
      'Részletes elemzést kapsz arról, melyik csakrád blokkolt, és ez hogyan nyilvánul meg az életed különböző területein',
    icon: '💡',
    gradient: 'from-spiritual-rose-400 to-spiritual-rose-600',
  },
  {
    number: '03',
    title: 'Gyógyulás',
    description:
      'Konkrét, gyakorlati lépéseket mutatunk, amelyekkel elkezdheted feloldani a blokkokat és helyreállítani az egyensúlyt',
    icon: '✨',
    gradient: 'from-spiritual-gold-400 to-spiritual-gold-600',
  },
];

export default function SolutionSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-spiritual-purple-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-spiritual-purple-900 mb-4">
            A csakráid térképe megmutatja az utat
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Három egyszerű lépésben a blokkolt energiáidtól a harmonikus élet felé
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              <Card hover className="h-full">
                <div className="flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>

              {/* Arrow connector (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 -right-4 transform translate-x-1/2 text-4xl text-spiritual-purple-300">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Chakra visualization preview */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-spiritual-purple-50 to-spiritual-rose-50">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-6">
              {/* Simplified chakra visualization */}
              <div className="relative flex flex-col items-center space-y-4">
                <p className="text-sm font-semibold text-spiritual-purple-700 mb-2">
                  7 Csakra Térképe
                </p>
                {[
                  { color: 'bg-chakra-crown', name: 'Korona' },
                  { color: 'bg-chakra-third', name: 'Harmadik szem' },
                  { color: 'bg-chakra-throat', name: 'Torok' },
                  { color: 'bg-chakra-heart', name: 'Szív' },
                  { color: 'bg-chakra-solar', name: 'Napfonat' },
                  { color: 'bg-chakra-sacral', name: 'Szakrális' },
                  { color: 'bg-chakra-root', name: 'Gyökér' },
                ].map((chakra, idx) => (
                  <motion.div
                    key={chakra.name}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 0.4 }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${chakra.color} animate-pulse-slow`}
                    />
                    <span className="text-xs text-gray-600">{chakra.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Minden csakra egyedi történetet mesél
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Az elemzésed személyre szabott betekintést ad abba, hogy melyik
                  energiaközpontod működik harmonikusan, és hol van szükség
                  figyelmre. Így pontosan tudni fogod, merre indulj el.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
