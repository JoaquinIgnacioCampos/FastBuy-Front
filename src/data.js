export const EVENT = {
  name: 'Festival Eclipse',
  venue: 'Costanera Sur · CABA',
  hours: 'Sáb 21:00 — 04:00',
};

export const BARS = [
  { id: 'north', label: 'Barra Norte', location: 'Planta baja · cerca del escenario principal' },
  { id: 'south', label: 'Barra Sur',   location: 'Planta alta · sector VIP' },
  { id: 'vip',   label: 'Barra VIP',   location: 'Terraza · acceso con pulsera azul' },
];

export const CATEGORIES = [
  { id: 'cervezas', label: 'Cervezas', emoji: '🍺' },
  { id: 'tragos', label: 'Tragos', emoji: '🍹' },
  { id: 'shots', label: 'Shots', emoji: '🥃' },
  { id: 'sinAlcohol', label: 'Sin alcohol', emoji: '🥤' },
];

export const PRODUCTS = [
  { id: 'p1', category: 'cervezas', emoji: '🍺', name: 'Stella Artois', subtitle: 'Pinta · 473 ml', price: 3500, stock: 42 },
  { id: 'p2', category: 'cervezas', emoji: '🍺', name: 'Quilmes Lager', subtitle: 'Vaso · 400 ml', price: 2800, stock: 73 },
  { id: 'p3', category: 'cervezas', emoji: '🍺', name: 'Corona Extra', subtitle: 'Porrón · 355 ml', price: 3200, stock: 4 },
  { id: 'p4', category: 'cervezas', emoji: '🍺', name: 'Heineken', subtitle: 'Vaso · 400 ml', price: 3300, stock: 0 },
  { id: 'p5', category: 'tragos', emoji: '🥃', name: 'Fernet con Coca', subtitle: 'Vaso largo', price: 4200, stock: 99 },
  { id: 'p6', category: 'tragos', emoji: '🍸', name: 'Gin Tonic', subtitle: 'Beefeater + tónica', price: 5500, stock: 27 },
  { id: 'p7', category: 'tragos', emoji: '🍊', name: 'Aperol Spritz', subtitle: 'Copa · 300 ml', price: 5200, stock: 18 },
  { id: 'p8', category: 'tragos', emoji: '🍹', name: 'Cuba Libre', subtitle: 'Vaso largo', price: 4500, stock: 31 },
  { id: 'p9', category: 'shots', emoji: '🥃', name: 'Jägermeister', subtitle: 'Shot 30 ml', price: 2500, stock: 60 },
  { id: 'p10', category: 'shots', emoji: '🌵', name: 'Tequila Reposado', subtitle: 'Shot 30 ml', price: 2700, stock: 22 },
  { id: 'p11', category: 'sinAlcohol', emoji: '🥤', name: 'Coca-Cola', subtitle: 'Lata · 354 ml', price: 2000, stock: 88 },
  { id: 'p12', category: 'sinAlcohol', emoji: '⚡', name: 'Speed XL', subtitle: 'Lata · 473 ml', price: 3000, stock: 12 },
  { id: 'p13', category: 'sinAlcohol', emoji: '💧', name: 'Agua mineral', subtitle: 'Botella · 500 ml', price: 1500, stock: 120 },
];

export const fmt = (n) =>
  '$' + n.toLocaleString('es-AR');
