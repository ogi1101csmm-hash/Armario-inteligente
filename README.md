# Mi Armario Inteligente

PWA estática lista para GitHub Pages. Guarda prendas, fotos, favoritos e historial en IndexedDB del dispositivo.

## Publicar en GitHub Pages
1. Crea un repositorio nuevo (por ejemplo `mi-armario`).
2. Sube **todo el contenido** de esta carpeta a la raíz del repositorio.
3. GitHub → Settings → Pages.
4. En **Build and deployment**, selecciona `Deploy from a branch`.
5. Branch: `main` y carpeta `/ (root)` → Save.
6. Abre la URL que GitHub te da desde Safari en el iPhone.
7. Safari → Compartir → **Añadir a pantalla de inicio**.

## Datos y privacidad
- Las fotos NO se suben a GitHub.
- Las prendas se guardan en IndexedDB en el navegador/dispositivo.
- Usa Ajustes → Exportar backup antes de borrar datos de Safari o cambiar de iPhone.
- Para abrir Ajustes: doble toque en el título superior, o mantenerlo pulsado ~0,7 s.

## Funciones
- Fotos reales de las prendas.
- Filtros por categoría.
- Estado limpia/usada.
- Generador por ocasión, temperatura y estilo.
- Prenda obligatoria ("quiero ponerme esto").
- Compatibilidad de colores.
- Penalización de prendas usadas recientemente.
- Favoritos e historial.
- Backup JSON con fotos incluidas.
- PWA/offline mediante Service Worker.


## v7
- Alta de prendas restaurada desde la primera versión funcional (IndexedDB + dialog nativo).
- Solo categorías masculinas y solo zapatillas como calzado.
- Tarjeta completa roja cuando la prenda está para lavar.
- Paleta de color extraída de la foto para mejorar outfits.

- Las prendas disponibles se muestran con el mosaico completo en verde.
- Las prendas para lavar se mantienen con el mosaico completo en rojo.

- Al añadir prendas, ahora puedes elegir entre hacer una foto con la cámara o subirla desde la fototeca.

- Las zapatillas no se marcan automáticamente como sucias al usar un outfit. Solo pueden cambiarse manualmente a “para lavar”.

- Al usar un outfit, la ropa normal NO pasa automáticamente a lavar.
- Solo las prendas con estilo Sport o con ocasión Deporte se marcan automáticamente para lavar.
- Zapatillas y resto de prendas se cambian manualmente.

- En “¿Para qué me visto?” solo aparecen: Diario, Trabajo, Evento y Entrenar.
- En “Estilo” solo aparecen: Casual, Arreglado y Deporte.
