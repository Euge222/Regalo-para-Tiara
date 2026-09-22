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
/* ==========================
   SOBRE / CARTA
   Al tocar el sobre, se abre o cierra la carta.
========================== */

const botonSobre = document.getElementById('envelope-btn');
const cajaCarta = document.getElementById('letter-box');

botonSobre.addEventListener('click', () => {
  const estaAbierta = cajaCarta.classList.toggle('letter--open');
  botonSobre.setAttribute('aria-expanded', estaAbierta);
});
/*===========================================================
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


/*NUBES DE FONDO*/

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
  for (let i = 0; i < CANTIDAD_NUBES; i++) {
    agregarNubeAlAzar(contenedorNubes);
  }



/* ============================================================
   PÉTALOS QUE CAEN
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
for (let i = 0; i < CANTIDAD_PETALOS; i++) {
  agregarPetaloAlAzar(contenedorPetalos);
}