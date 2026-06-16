import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const titleThemes = {
  'ashes-to-crown': { c1: '#7f1d1d', c2: '#451a03', label: 'DRAMA', sub: 'Ashes to Crown' },
  'nexus-protocol': { c1: '#0e7490', c2: '#164e63', label: 'SCI-FI', sub: 'Nexus Protocol' },
  'cipher-origins': { c1: '#1e3a5f', c2: '#0f172a', label: 'THRILLER', sub: 'Cipher Origins' },
  'quantum-void': { c1: '#5b21b6', c2: '#312e81', label: 'SCI-FI', sub: 'Quantum Void' },
  'digital-dreams': { c1: '#be185d', c2: '#831843', label: 'DRAMA', sub: 'Digital Dreams' },
  'synthetic-hearts': { c1: '#db2777', c2: '#9d174d', label: 'DRAMA', sub: 'Synthetic Hearts' },
  'parallax-universe': { c1: '#0369a1', c2: '#1e1b4b', label: 'SCI-FI', sub: 'Parallax Universe' },
  'ai-genesis': { c1: '#059669', c2: '#064e3b', label: 'AI ORIGINAL', sub: 'AI Genesis' },
  'neural-stories': { c1: '#7c3aed', c2: '#4c1d95', label: 'SERIES', sub: 'Neural Stories' },
  'algorithmic-dreams': { c1: '#b45309', c2: '#78350f', label: 'THRILLER', sub: 'Algorithmic Dreams' },
  'synthetic-worlds': { c1: '#0d9488', c2: '#134e4a', label: 'AI ORIGINAL', sub: 'Synthetic Worlds' },
  'data-consciousness': { c1: '#4338ca', c2: '#1e1b4b', label: 'DRAMA', sub: 'Data Consciousness' },
};

function posterSvg(slug, theme) {
  const id = slug.replace(/[^a-z0-9]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.c1}"/>
      <stop offset="100%" stop-color="${theme.c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#bg-${id})"/>
  <circle cx="320" cy="100" r="90" fill="#ffffff" opacity="0.08"/>
  <circle cx="80" cy="520" r="120" fill="#e11d48" opacity="0.15"/>
  <text x="28" y="520" fill="#f8fafc" font-family="Arial,sans-serif" font-size="14" font-weight="700" opacity="0.9">XORAL</text>
  <text x="28" y="548" fill="#fcd34d" font-family="Arial,sans-serif" font-size="11" font-weight="600">${theme.label}</text>
  <text x="28" y="575" fill="#e2e8f0" font-family="Arial,sans-serif" font-size="16" font-weight="700">${theme.sub}</text>
</svg>`;
}

function avatarSvg(name, accent, initial) {
  const id = name.replace(/[^a-z0-9]/gi, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="av-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#av-${id})"/>
  <circle cx="200" cy="160" r="72" fill="#ffffff" opacity="0.12"/>
  <text x="200" y="200" text-anchor="middle" fill="#f8fafc" font-family="Arial,sans-serif" font-size="72" font-weight="800">${initial}</text>
  <text x="200" y="340" text-anchor="middle" fill="#cbd5e1" font-family="Arial,sans-serif" font-size="18" font-weight="600">${name}</text>
</svg>`;
}

const characters = [
  ['clara-christopher', 'Clara Christopher', '#be185d', 'CC'],
  ['fiona-matthew', 'Fiona Matthew', '#059669', 'FM'],
  ['layla-baker', 'Layla Baker', '#7c3aed', 'LB'],
  ['lora-adams', 'Lora Adams', '#ea580c', 'LA'],
  ['nnena-kasim', 'Nnena Kasim', '#0891b2', 'NK'],
  ['sandra-rosewood', 'Sandra Rosewood', '#db2777', 'SR'],
  ['sapphire-paggie', 'Sapphire Paggie', '#4f46e5', 'SP'],
  ['cho-ichiro', 'Cho Ichiro', '#0d9488', 'CI'],
  ['clark-sylvester', 'Clark Sylvester', '#2563eb', 'CS'],
  ['davis-blake', 'Davis Blake', '#ca8a04', 'DB'],
  ['davids-valentino', "David's Valentino", '#64748b', 'DV'],
  ['henry-uchenna', 'Henry Uchenna', '#16a34a', 'HU'],
  ['nicolas-martinez', 'Nicolas Martinez', '#dc2626', 'NM'],
  ['spencer-hawk', 'Spencer Hawk', '#9333ea', 'SH'],
];

const creators = [
  ['cr1', 'Alex Nova', '#0ea5e9', 'AN'],
  ['cr2', 'Maya Chen', '#ec4899', 'MC'],
  ['cr3', 'Isaac Moore', '#22c55e', 'IM'],
  ['cr4', 'Sophia Rivers', '#a855f7', 'SR'],
];

mkdirSync(join(publicDir, 'posters'), { recursive: true });
mkdirSync(join(publicDir, 'avatars'), { recursive: true });
mkdirSync(join(publicDir, 'creators'), { recursive: true });

for (const [slug, theme] of Object.entries(titleThemes)) {
  writeFileSync(join(publicDir, 'posters', `${slug}.svg`), posterSvg(slug, theme));
}

for (const [slug, name, accent, initial] of characters) {
  writeFileSync(join(publicDir, 'avatars', `${slug}.svg`), avatarSvg(name, accent, initial));
}

for (const [id, name, accent, initial] of creators) {
  writeFileSync(join(publicDir, 'creators', `${id}.svg`), avatarSvg(name, accent, initial));
}

console.log('Generated', Object.keys(titleThemes).length, 'posters,', characters.length, 'avatars,', creators.length, 'creators');
