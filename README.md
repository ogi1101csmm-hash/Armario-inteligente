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
