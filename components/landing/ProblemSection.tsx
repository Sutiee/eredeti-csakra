'use client';

import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

const symptoms = [
  {
    icon: '💔',
    category: 'Érzelmi',
    title: 'Folyamatos szorongás',
    description: 'Állandó félelem, bizonytalanság, vagy lehangoltság érzése',
  },
  {
    icon: '😫',
    category: 'Fizikai',
    title: 'Krónikus fájdalom',
    description: 'Visszatérő fejfájás, hátfájás, fáradtság vagy energiahiány',
  },
  {
    icon: '💬',
    category: 'Kapcsolati',
    title: 'Nehéz kapcsolatok',
    description: 'Mély, őszinte kapcsolatok kialakítása nehézségekbe ütközik',
  },
  {
    icon: '🌀',
    category: 'Spirituális',
    title: 'Elakadtál',
    description: 'Céltalan vagy, nem tudod, mi a helyedet ebben a világban',
  },
  {
    icon: '💸',
    category: 'Pénzügyi',
    title: 'Állandó hiányérzet',
    description: 'Pénzügyi nehézségek, vagy soha nem érzed elégnek, amid van',
  },
  {
    icon: '🧠',
    category: 'Mentális',
    title: 'Zavaros gondolatok',
    description: 'Nehezen koncentrálsz, döntésképtelenség, mentális köd',
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-spiritual-purple-50">
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
            Ismerd fel a jeleket
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Ezek a tünetek arra utalnak, hogy egy vagy több csakrád energiája
            blokkolva van
          </p>
        </motion.div>

        {/* Symptom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {symptoms.map((symptom, index) => (
            <motion.div
              key={symptom.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card hover className="h-full">
                <div className="flex flex-col items-start">
                  {/* Icon */}
                  <div className="text-5xl mb-4">{symptom.icon}</div>

                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-spiritual-purple-700 bg-spiritual-purple-100 rounded-full mb-3">
                    {symptom.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {symptom.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {symptom.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom text */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-gray-700 text-lg">
            Ha{' '}
            <span className="font-bold text-spiritual-purple-700">
              felismersz magadban legalább 2-3 tünetet
            </span>
            , érdemes feltérképezned a csakráidat
          </p>
        </motion.div>
      </div>
    </section>
  );
}
