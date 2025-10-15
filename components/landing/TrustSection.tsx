'use client';

import { motion } from 'framer-motion';

export default function TrustSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-spiritual-purple-900 mb-4">
              Mi az a csakra?
            </h2>
            <div className="w-24 h-1 bg-gradient-spiritual mx-auto rounded-full" />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <motion.div
              className="space-y-6 text-gray-700 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <p className="text-lg md:text-xl">
                A <strong className="text-spiritual-purple-700">csakrák</strong>{' '}
                ősi indiai bölcsességből származó energiaközpontok a testünkben,
                amelyek összekötik fizikai és spirituális létünket. Hét fő
                csakránk van, amelyek a gerincoszlop mentén helyezkednek el, a
                farokcsont tövétől egészen a fejtető csúcsáig.
              </p>

              <p className="text-lg md:text-xl">
                Amikor egy csakra{' '}
                <strong className="text-spiritual-rose-600">harmonikusan</strong>{' '}
                működik, az életenergia szabadon áramlik, és egészségesnek,
                kiegyensúlyozottnak érezzük magunkat. Azonban amikor egy vagy több
                csakra{' '}
                <strong className="text-spiritual-rose-600">blokkolva van</strong>,
                az energiaáramlás megreked, és ez testi, érzelmi vagy mentális
                problémákként nyilvánulhat meg.
              </p>

              <p className="text-lg md:text-xl">
                Az élet kihívásai - stressz, trauma, elfojtott érzelmek, vagy akár
                negatív gondolkodási minták - mind hozzájárulhatnak a csakrák
                blokkolásához. A jó hír, hogy{' '}
                <strong className="text-spiritual-purple-700">
                  ezeket a blokkokat fel lehet oldani
                </strong>
                , és helyreállíthatod belső egyensúlyodat.
              </p>
            </motion.div>

            {/* Quote box */}
            <motion.div
              className="mt-10 p-8 bg-gradient-to-br from-spiritual-purple-50 to-spiritual-rose-50 rounded-2xl border-l-4 border-spiritual-purple-400"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-xl italic text-gray-800 font-serif">
                "Az első lépés a gyógyuláshoz az, hogy megérted, hol van szükség
                változásra. A csakra elemzés pontosan ezt teszi lehetővé számodra."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
