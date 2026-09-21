VERSIÓN 5 — CINEMÁTICA

Base: V4 operativa.

Cambios visuales:
- El nombre visible ahora es “Cinemática”.
- Se conserva la URL /movimiento/ para no romper enlaces existentes.
- Autos MRU/MRUA completamente redibujados y orientados claramente hacia la derecha.
- MRU azul y MRUA rojo.
- Nuevo fondo de carretera con cielo, nubes, montañas, árboles y guardarraíl,
  inspirado en el diseño aprobado.
- El logo UFRO, controles, simulaciones, gráficos, tramos, parabólico,
  teoría y ejercicios de V4 se mantienen.

SUBIDA A GITHUB
Reemplaza la carpeta movimiento/ de tu repositorio por la carpeta movimiento/
incluida aquí. Si quieres también actualizar el portal inicial, reemplaza index.html.
Haz Commit changes y luego Ctrl+F5.


V5.1: Todas las gráficas incluyen ejes, unidades SI y marcas numéricas: t (s), x/y (m), v (m/s) y a (m/s²).


V5.2:
- En MRU/MRUA se puede elegir: ambos, solo MRU o solo MRUA.
- Autos y curvas se ocultan/muestran de acuerdo con la selección.
- En la gráfica v(t), el área sigue representando Δx para MRUA.
- En la gráfica a(t), se agregó “Área = Δv” y lectura numérica en m/s.


V5.3: corrige actualización inmediata al elegir solo MRU/MRUA, refuerza ejes y unidades SI en todas las gráficas y fuerza recarga de CSS/JS en GitHub Pages.


V5.4:
- Corrige el sombreado del área en v–t (Δx) y a–t (Δv).
- El eje vertical incluye y = 0 cuando el área está activada, de modo que el sombreado sea visible.
- El área se rellena hasta el instante actual de la simulación y crece a medida que avanza el tiempo.
- Se agrega lectura numérica de Δx (m) y se mantiene Δv (m/s).
- En modo Solo MRU, el área v–t corresponde al MRU; en Solo MRUA corresponde al MRUA.


V6.0 — Movimiento circular integrado
- Base visual y funcional: V5.4 corregida.
- Se conservan MRU/MRUA, áreas Δx y Δv, ejes SI, tramos y parabólico.
- Se incorpora el nuevo módulo de Movimiento Circular (MCU y MCUA).
- Incluye radio, θ0, ω0, α, vectores, magnitudes lineales y angulares.
- Incluye encuentros de dos móviles, incluso con radios diferentes.
- Incluye gráficos θ–t, ω–t y α–t con ejes y unidades SI.
- Incluye ejercicios específicos de movimiento circular.
- Se agregan accesos “Circular” en menú superior y lateral.
- Se mantiene la ruta /movimiento/ para no cambiar el enlace de Moodle.


V6.1 — preguntas actualizadas
- Se reemplaza el banco antiguo de 12 ejercicios por las 18 preguntas de la nueva versión.
- Incluye 6 preguntas de movimiento circular (MCU/MCUA).
- Se mantienen las preguntas conceptuales con alternativas.
- El contador y progreso ahora usan 18 ejercicios.


V6.2:
- Nueva opción independiente: Mostrar aceleración total.
- El vector total es la suma de aceleración centrípeta y tangencial.
- Corregido el arco de θ para giros positivos, negativos y múltiples vueltas.
- Corregida la orientación de los vectores tangenciales según el signo de ω y α.


V6.3:
- En MCUA, al activar la resultante se muestran simultáneamente a_c, a_t y a.
- La resultante a se calcula vectorialmente como a = a_c + a_t.
- Se etiquetan en la figura a_c, a_t y a.
- En MCU la opción de resultante se deshabilita porque a_t = 0 y la resultante coincide con a_c.


V6.4:
- La resultante a se activa automáticamente al entrar a MCUA.
- Se dibuja con mayor longitud, mayor grosor y halo blanco para que no se confunda con a_c o a_t.
- Se mantiene como suma vectorial real de a_c + a_t.


V6.5:
- Corregida la representación gráfica de a = a_c + a_t.
- a_c, a_t y a usan ahora la misma escala gráfica.
- La resultante es exactamente la diagonal del paralelogramo formado por a_c y a_t.
- Se agregan líneas auxiliares punteadas del paralelogramo para hacer visible la suma vectorial.


V6.6:
- Se elimina la opción y el vector de aceleración resultante.
- En movimiento circular quedan visibles únicamente las componentes a_c y a_t.


V7.0:
- Nueva pestaña/sección Movimiento vertical.
- Dos modos: lanzamiento vertical hacia arriba y caída libre.
- Convención +y hacia arriba y g = 9,81 m/s².
- Animación del móvil con vectores opcionales v_y y a_y.
- Controles de y0 y v0.
- Gráficos y(t), v_y(t) y a_y(t), con unidades SI.
- Muestra altura máxima, tiempo hasta la cima y tiempo hasta el suelo.
- Se agregó una tarjeta de teoría de movimiento vertical.


V7.1:
- Los parámetros de Movimiento vertical y Lanzamiento parabólico usan campos numéricos editables con flechas, como MRU/MRUA.
- Se mantienen deslizadores solo para recorrer el tiempo de las animaciones.
- Selector de gravedad en Movimiento vertical y Parabólico: Tierra 9,81 m/s², Marte 3,71 m/s² y Luna 1,62 m/s².
- Todos los cálculos, animaciones y gráficos de esos módulos se actualizan con la gravedad elegida.
