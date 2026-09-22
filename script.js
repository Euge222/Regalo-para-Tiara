/*
  Comportamiento principal de la página: sonidos de los logos, la
  carta que se abre (con su gif sorpresa), el aviso de fotos que
  faltan, y los adornos que se dibujan por código (margaritas,
  nubes, pétalos).

  Cada bloque de acá abajo es independiente: se puede leer, tocar
  o borrar uno sin afectar a los demás.
*/


/* ============================================================
   AYUDA COMPARTIDA
   ============================================================ */

/**
 * Dice si la persona que ve la página pidió "reducir movimiento"
 * en las preferencias de su sistema operativo.
 * @returns {boolean}
 */
function prefiereMenosMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* ============================================================
   SONIDO DE LOS LOGOS
   Cada logo de esquina tiene un audio propio. Tocarlo lo reproduce
   desde el principio, salvo que el editor de posiciones esté
   activo (ahí el clic sirve para arrastrar, no para sonar).
   ============================================================ */

const sonidoLogoIzquierda = new Audio('audio/bubu_ataaata.mp3');
const sonidoLogoDerecha = new Audio('audio/tata_lala.mp3');

/**
 * Reproduce un audio desde el principio.
 * @param {HTMLAudioElement} audio
 */
function reproducirSonido(audio) {
  audio.currentTime = 0;
  audio.play().catch((error) => {
    console.warn('No se pudo reproducir el sonido', error);
  });
}

/**
 * Reproduce el audio de un logo, salvo que se esté usando el
 * editor de posiciones para arrastrarlo.
 * @param {HTMLAudioElement} audio
 */
function alTocarLogo(audio) {
  if (document.body.classList.contains('modo-edicion')) return;
  reproducirSonido(audio);
}

document.querySelector('.corner-logo--top-left')
  .addEventListener('click', () => alTocarLogo(sonidoLogoIzquierda));

document.querySelector('.corner-logo--bottom-right')
  .addEventListener('click', () => alTocarLogo(sonidoLogoDerecha));


/* ============================================================
   SORPRESA DE LA CARTA
   El gif del osito solo debería animarse mientras está a la
   vista. Si en vez de eso se deja un <img> fijo en el HTML y
   se lo muestra/oculta con opacidad, algunos navegadores lo
   pausan mientras está invisible y, al volver a mostrarlo, se ve
   como una foto quieta en vez de seguir animando.

   Para evitarlo, la imagen NO vive en el HTML: se crea recién
   cuando la carta se abre (así el navegador la decodifica de
   cero y arranca la animación desde el primer cuadro) y se borra
   del todo cuando termina de ocultarse.
   ============================================================ */

const RUTA_GIF_SORPRESA = 'images/mocha-love.webp';
const DURACION_GIF_VISIBLE_MS = 3500;

const envoltorioGifSorpresa = document.querySelector('.letter__gif-wrap');

/**
 * Crea el osito sorpresa dentro de la carta y lo hace aparecer
 * con una transición. Si ya había uno de una apertura anterior,
 * lo reemplaza.
 */
function mostrarGifSorpresa() {
  envoltorioGifSorpresa.querySelector('.letter__gif')?.remove();

  const gif = document.createElement('img');
  gif.src = RUTA_GIF_SORPRESA;
  gif.alt = '';
  gif.width = 370;
  gif.height = 300;
  gif.className = 'letter__gif';
  envoltorioGifSorpresa.appendChild(gif);

  requestAnimationFrame(() => gif.classList.add('letter__gif--visible'));

  setTimeout(ocultarGifSorpresa, DURACION_GIF_VISIBLE_MS);
}

/**
 * Hace desaparecer el osito sorpresa con una transición y, una
 * vez terminada, lo borra del documento.
 */
function ocultarGifSorpresa() {
  const gif = envoltorioGifSorpresa.querySelector('.letter__gif');
  if (!gif) return;

  gif.classList.remove('letter__gif--visible');
  gif.addEventListener('transitionend', () => gif.remove(), { once: true });
}

const botonSobre = document.getElementById('envelope-btn');
const escenarioCarta = document.getElementById('letter-box');

botonSobre.addEventListener('click', () => {
  const estaAbierta = escenarioCarta.classList.toggle('letter--open');
  botonSobre.setAttribute('aria-expanded', estaAbierta);

  if (estaAbierta) {
    mostrarGifSorpresa();
  } else {
    ocultarGifSorpresa();
  }
});

/* ============================================================
   MARGARITAS
   Dibuja una margarita amarilla en SVG por cada tamaño de la
   lista, para la fila de flores amarillas.
   ============================================================ */

/**
 * Dibuja una margarita amarilla en SVG.
 * @param {number} tamanio ancho y alto en píxeles
 * @returns {SVGElement}
 */
function dibujarMargarita(tamanio) {
  const cantidadPetalos = 8;
  let petalos = '';

  for (let i = 0; i < cantidadPetalos; i++) {
    const angulo = (360 / cantidadPetalos) * i;
    petalos += `<ellipse cx="0" cy="-16" rx="6" ry="14" fill="#f4c542" stroke="#c98f22" stroke-width="0.6" transform="rotate(${angulo})"/>`;
  }

  const envoltorio = document.createElement('div');
  envoltorio.innerHTML = `
    <svg viewBox="-30 -30 60 60" width="${tamanio}" height="${tamanio}" xmlns="http://www.w3.org/2000/svg">
      <g>${petalos}</g>
      <circle cx="0" cy="0" r="8" fill="#c98f22"/>
    </svg>`;
  return envoltorio.firstElementChild;
}

const filaMargaritas = document.getElementById('bouquet-row');
const TAMANIOS_MARGARITAS = [64, 78, 58, 70, 60];

TAMANIOS_MARGARITAS.forEach((tamanio) => {
  filaMargaritas.appendChild(dibujarMargarita(tamanio));
});


/* ============================================================
   NUBES DE FONDO
   Nubes rosadas clarito que se mueven lento de izquierda a
   derecha. No se dibuja ninguna si la persona pidió reducir
   movimiento.
   ============================================================ */

const CANTIDAD_NUBES = 9;

/**
 * Dibuja una nube en SVG, como cuatro óvalos superpuestos.
 * @param {number} ancho en píxeles (el alto se calcula a partir de este)
 * @returns {SVGElement}
 */
function dibujarNube(ancho) {
  const alto = ancho * 0.55;
  const envoltorio = document.createElement('div');
  envoltorio.innerHTML = `
    <svg class="cloud" viewBox="0 0 100 55" width="${ancho}" height="${alto}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="28" cy="35" rx="24" ry="17"/>
      <ellipse cx="52" cy="24" rx="19" ry="15"/>
      <ellipse cx="74" cy="33" rx="17" ry="13"/>
      <ellipse cx="50" cy="40" rx="34" ry="13"/>
    </svg>`;
  return envoltorio.firstElementChild;
}

/**
 * Agrega una nube al contenedor de fondo, con tamaño, posición y
 * velocidad al azar.
 * @param {HTMLElement} contenedor
 */
function agregarNubeAlAzar(contenedor) {
  const ancho = 110 + Math.random() * 130;
  const duracion = 65 + Math.random() * 35;
  const nube = dibujarNube(ancho);

  nube.style.top = `${Math.random() * 78}vh`;
  nube.style.animationDuration = `${duracion}s`;
  nube.style.animationDelay = `${-Math.random() * duracion}s`;
  nube.style.opacity = `${0.16 + Math.random() * 0.1}`;

  contenedor.appendChild(nube);
}

const contenedorNubes = document.getElementById('cloud-field');

if (contenedorNubes && !prefiereMenosMovimiento()) {
  for (let i = 0; i < CANTIDAD_NUBES; i++) {
    agregarNubeAlAzar(contenedorNubes);
  }
}


/* ============================================================
   PÉTALOS QUE CAEN
   Igual que las nubes: no se dibuja ninguno si la persona pidió
   reducir movimiento.
   ============================================================ */

const CANTIDAD_PETALOS = 14;

/**
 * Agrega un pétalo cayendo al contenedor de fondo, con posición,
 * velocidad y tamaño al azar.
 * @param {HTMLElement} contenedor
 */
function agregarPetaloAlAzar(contenedor) {
  const duracionCaida = 9 + Math.random() * 8;
  const duracionHamaca = 3 + Math.random() * 3;
  const demora = Math.random() * 12; // para que no caigan todos juntos

  const petalo = document.createElement('div');
  petalo.className = 'petal';
  petalo.style.left = `${Math.random() * 100}vw`;
  petalo.style.animationDuration = `${duracionCaida}s, ${duracionHamaca}s`;
  petalo.style.animationDelay = `${demora}s, ${demora}s`;
  petalo.style.transform = `scale(${0.6 + Math.random() * 0.8})`;

  contenedor.appendChild(petalo);
}

const contenedorPetalos = document.getElementById('petal-field');

if (contenedorPetalos && !prefiereMenosMovimiento()) {
  for (let i = 0; i < CANTIDAD_PETALOS; i++) {
    agregarPetaloAlAzar(contenedorPetalos);
  }
}