'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cursor, Sparkle } from '@phosphor-icons/react';

export function Clicker() {
    const [count, setCount] = useState(0);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

    const handleClick = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCount(prev => prev + 1);
        setParticles(prev => [
            ...prev,
            { id: Date.now(), x, y }
        ]);

        // Remove particle after animation
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== Date.now()));
        }, 1000);
    };

    return (
        <motion.div 
            className="relative flex flex-col items-center justify-center p-8 rounded-lg bg-gradient-to-b from-primary/5 to-primary/10 cursor-pointer select-none"
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ 
                            opacity: 1, 
                            scale: 1,
                            x: particle.x,
                            y: particle.y
                        }}
                        animate={{ 
                            opacity: 0,
                            scale: 0,
                            y: particle.y - 50
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute text-primary"
                    >
                        <Sparkle size={24} weight="fill" />
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.div
                animate={{ 
                    rotate: count * 360,
                    scale: [1, 1.2, 1]
                }}
                transition={{ 
                    rotate: { duration: 0.5 },
                    scale: { duration: 0.2 }
                }}
                className="mb-4 text-primary"
            >
                <Cursor size={48} weight="fill" />
            </motion.div>

            <motion.div 
                className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.2 }}
                key={count}
            >
                {count}
            </motion.div>

            <p className="mt-4 text-muted-foreground text-center">
                Click me while you wait!
            </p>
        </motion.div>
    );
}
