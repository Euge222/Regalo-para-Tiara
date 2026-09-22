/*
  ============================================================
  EDITOR VISUAL DE POSICIÓN Y TAMAÑO DE IMÁGENES (OPCIONAL)
  ============================================================
  Arma todo lo que necesita por su cuenta (el botón flotante, sus
  estilos y la lógica de arrastrar/agrandar), sin tocar index.html
  ni styles.css. El día que ya no lo necesites, alcanza con borrar
  este archivo y la línea <script src="editor-posiciones.js"> de
  index.html.

  Cómo se usa:
  El botón "🖼️ Mover imágenes" activa el modo edición. Cualquier
  imagen marcada con data-mover en el HTML (logos, stickers, el
  gif de la carta, fotos de la galería) se puede:
    - ARRASTRAR con el mouse o el dedo, para moverla.
    - AGRANDAR/ACHICAR girando la rueda del mouse encima.
  Todo se guarda en este navegador (localStorage).

  "↩️ Restablecer todo" borra lo guardado en este navegador y
  devuelve las imágenes a su posición original del CSS.

  "📋 Copiar posiciones" copia el CSS final para pegarlo en
  styles.css, y que la posición quede fija para cualquiera que
  visite la página (no solo en tu navegador).
  ============================================================
*/

(function iniciarEditorDePosiciones() {

  const CLAVE_POSICIONES = 'posiciones-imagenes';
  const PASO_ZOOM = 0.08;
  const ESCALA_MINIMA = 0.3;
  const ESCALA_MAXIMA = 3;

  const posicionesGuardadas = JSON.parse(localStorage.getItem(CLAVE_POSICIONES) || '{}');
  const imagenesMovibles = document.querySelectorAll('[data-mover]');

  // Elemento que se está arrastrando en este momento, o null si no hay ninguno
  let elementoArrastrado = null;
  let puntoInicialX = 0;
  let puntoInicialY = 0;
  let origenXAlArrastrar = 0;
  let origenYAlArrastrar = 0;


  /* ==========================
     ESTILOS DEL EDITOR
     Se inyectan acá mismo para que no haga falta tocar
     styles.css por esta función opcional.
  ========================== */

  function inyectarEstilosDelEditor() {
    const estilos = document.createElement('style');
    estilos.textContent = `
      .editor-bar {
        position: fixed;
        left: 14px;
        bottom: 14px;
        z-index: 30;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        max-width: calc(100vw - 28px);
      }

      .editor-bar button {
        font-family: 'Quicksand', sans-serif;
        font-weight: 600;
        font-size: 0.82rem;
        border: 1px solid var(--rose-line, rgba(224, 87, 143, 0.25));
        border-radius: 999px;
        padding: 8px 14px;
        background: var(--bg-panel-2, #2a1a24);
        color: var(--text, #f6ecf1);
        cursor: pointer;
        box-shadow: var(--sombra, 0 18px 40px -20px rgba(0, 0, 0, 0.6));
      }

      .editor-bar button[aria-pressed="true"] {
        background: var(--rose, #e0578f);
        color: var(--bg, #150c12);
      }

      .editor-hint {
        margin: 0;
        font-size: 0.78rem;
        color: var(--text-soft, #c9a8bb);
        background: var(--bg-panel-2, #2a1a24);
        border-radius: 999px;
        padding: 6px 12px;
      }

      body.modo-edicion [data-mover] {
        outline: 2px dashed var(--rose, #e0578f);
        outline-offset: 2px;
        cursor: grab;
        touch-action: none;
        pointer-events: auto;
      }

      body.modo-edicion [data-mover]:active {
        cursor: grabbing;
      }
    `;
    document.head.appendChild(estilos);
  }


  /* ==========================
     BARRA FLOTANTE
  ========================== */

  function crearBarraDelEditor() {
    const barra = document.createElement('div');
    barra.className = 'editor-bar';
    barra.innerHTML = `
      <button type="button" id="editor-toggle" aria-pressed="false">🖼️ Mover imágenes</button>
      <button type="button" id="editor-copy" hidden>📋 Copiar posiciones</button>
      <button type="button" id="editor-reset" hidden>↩️ Restablecer todo</button>
      <p class="editor-hint" id="editor-hint" hidden>arrastrá para mover · rueda del mouse para agrandar o achicar</p>
    `;
    document.body.appendChild(barra);
    return barra;
  }


  /* ==========================
     POSICIÓN Y TAMAÑO DE CADA IMAGEN
  ========================== */

  /**
   * Arma el CSS "transform" a partir de una posición y un tamaño.
   * @param {{x?: number, y?: number, escala?: number}} datos
   * @returns {string}
   */
  function transformDe({ x = 0, y = 0, escala = 1 }) {
    return `translate(${x}px, ${y}px) scale(${escala})`;
  }

  /**
   * Guarda en localStorage la posición y el tamaño actuales de
   * una imagen movible.
   * @param {HTMLElement} imagen
   */
  function guardarPosicion(imagen) {
    posicionesGuardadas[imagen.dataset.mover] = {
      x: Number(imagen.dataset.x) || 0,
      y: Number(imagen.dataset.y) || 0,
      escala: Number(imagen.dataset.escala) || 1
    };
    localStorage.setItem(CLAVE_POSICIONES, JSON.stringify(posicionesGuardadas));
  }

  /**
   * Aplica a cada imagen movible la posición guardada en una
   * visita anterior, si es que hay alguna.
   */
  function aplicarPosicionesGuardadas() {
    imagenesMovibles.forEach((imagen) => {
      const guardada = posicionesGuardadas[imagen.dataset.mover];
      if (!guardada) return;

      imagen.dataset.x = guardada.x;
      imagen.dataset.y = guardada.y;
      imagen.dataset.escala = guardada.escala;
      imagen.style.transform = transformDe(guardada);
    });
  }


  /* ==========================
     ARRASTRAR (usa un solo listener por evento en el documento,
     en vez de uno por cada imagen, para no anidar funciones)
  ========================== */

  function estaEnModoEdicion() {
    return document.body.classList.contains('modo-edicion');
  }

  /**
   * Empieza a arrastrar la imagen movible más cercana al lugar
   * donde se apretó el mouse o el dedo, si el modo edición está
   * activo.
   * @param {PointerEvent} evento
   */
  function iniciarArrastre(evento) {
    if (!estaEnModoEdicion()) return;

    const imagen = evento.target.closest('[data-mover]');
    if (!imagen) return;

    evento.preventDefault();
    imagen.setPointerCapture(evento.pointerId);

    elementoArrastrado = imagen;
    puntoInicialX = evento.clientX;
    puntoInicialY = evento.clientY;
    origenXAlArrastrar = Number(imagen.dataset.x) || 0;
    origenYAlArrastrar = Number(imagen.dataset.y) || 0;
  }

  /**
   * Mueve la imagen que se esté arrastrando, si hay alguna.
   * @param {PointerEvent} evento
   */
  function moverElemento(evento) {
    if (!elementoArrastrado) return;

    const x = origenXAlArrastrar + (evento.clientX - puntoInicialX);
    const y = origenYAlArrastrar + (evento.clientY - puntoInicialY);
    const escala = Number(elementoArrastrado.dataset.escala) || 1;

    elementoArrastrado.dataset.x = x;
    elementoArrastrado.dataset.y = y;
    elementoArrastrado.style.transform = transformDe({ x, y, escala });
  }

  /**
   * Termina el arrastre en curso y guarda la posición final.
   */
  function soltarElemento() {
    if (!elementoArrastrado) return;

    guardarPosicion(elementoArrastrado);
    elementoArrastrado = null;
  }


  /* ==========================
     AGRANDAR / ACHICAR CON LA RUEDA DEL MOUSE
  ========================== */

  /**
   * Agranda o achica, con la rueda del mouse, la imagen movible
   * que esté debajo del cursor, si el modo edición está activo.
   * @param {WheelEvent} evento
   */
  function escalarElemento(evento) {
    if (!estaEnModoEdicion()) return;

    const imagen = evento.target.closest('[data-mover]');
    if (!imagen) return;

    evento.preventDefault();

    const x = Number(imagen.dataset.x) || 0;
    const y = Number(imagen.dataset.y) || 0;
    const escalaActual = Number(imagen.dataset.escala) || 1;

    // Scroll hacia arriba (deltaY negativo) agranda; hacia abajo achica
    const direccion = evento.deltaY < 0 ? 1 : -1;
    const nuevaEscala = Math.min(
      ESCALA_MAXIMA,
      Math.max(ESCALA_MINIMA, escalaActual + direccion * PASO_ZOOM)
    );

    imagen.dataset.escala = nuevaEscala;
    imagen.style.transform = transformDe({ x, y, escala: nuevaEscala });
    guardarPosicion(imagen);
  }


  /* ==========================
     BOTONES DE LA BARRA
  ========================== */

  /**
   * Prende o apaga el modo edición y actualiza la barra flotante.
   * @param {object} botones los cuatro elementos de la barra
   */
  function alternarModoEdicion(botones) {
    const activo = document.body.classList.toggle('modo-edicion');
    botones.toggle.setAttribute('aria-pressed', activo);
    botones.copiar.hidden = !activo;
    botones.reset.hidden = !activo;
    botones.ayuda.hidden = !activo;
  }

  /**
   * Copia al portapapeles el CSS con la posición y el tamaño de
   * cada imagen que se movió.
   */
  function copiarPosiciones() {
    const claves = Object.keys(posicionesGuardadas);

    if (claves.length === 0) {
      alert('Todavía no moviste ni agrandaste ninguna imagen.');
      return;
    }

    const css = claves
      .map((clave) => `[data-mover="${clave}"] { transform: ${transformDe(posicionesGuardadas[clave])}; }`)
      .join('\n');

    navigator.clipboard.writeText(css)
      .then(() => alert('¡Copiado! Pegá esto al final de styles.css para que quede fijo.'))
      .catch(() => alert(`Copiá esto a mano y pegalo en styles.css:\n\n${css}`));
  }

  /**
   * Borra todo lo guardado en este navegador y devuelve cada
   * imagen a su posición y tamaño original del CSS.
   */
  function restablecerTodo() {
    if (Object.keys(posicionesGuardadas).length === 0) {
      alert('No hay nada guardado para restablecer.');
      return;
    }

    const confirmado = confirm('¿Devolver TODAS las imágenes a su posición y tamaño original? Esto no se puede deshacer.');
    if (!confirmado) return;

    imagenesMovibles.forEach((imagen) => {
      delete imagen.dataset.x;
      delete imagen.dataset.y;
      delete imagen.dataset.escala;
      imagen.style.transform = '';
    });

    Object.keys(posicionesGuardadas).forEach((clave) => delete posicionesGuardadas[clave]);
    localStorage.removeItem(CLAVE_POSICIONES);

    alert('Listo, todas las imágenes volvieron a su tamaño y posición original.');
  }


  /* ==========================
     ARMADO INICIAL
  ========================== */

  inyectarEstilosDelEditor();
  aplicarPosicionesGuardadas();

  const barra = crearBarraDelEditor();
  const botones = {
    toggle: barra.querySelector('#editor-toggle'),
    copiar: barra.querySelector('#editor-copy'),
    reset: barra.querySelector('#editor-reset'),
    ayuda: barra.querySelector('#editor-hint')
  };

  botones.toggle.addEventListener('click', () => alternarModoEdicion(botones));
  botones.copiar.addEventListener('click', copiarPosiciones);
  botones.reset.addEventListener('click', restablecerTodo);

  document.addEventListener('pointerdown', iniciarArrastre);
  document.addEventListener('pointermove', moverElemento);
  document.addEventListener('pointerup', soltarElemento);
  document.addEventListener('pointercancel', soltarElemento);
  document.addEventListener('wheel', escalarElemento, { passive: false });

})();