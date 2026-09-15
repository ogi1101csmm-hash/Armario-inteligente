# Mi Armario Inteligente v2

Mejora principal: el generador ya no combina solo por el color que eliges manualmente, sino por la **paleta real extraída de la foto** de la prenda.

## Qué cambia
- Al subir una foto, la app calcula color dominante, secundario y acento.
- El generador prioriza:
  - bases neutras (beige, blanco, negro, gris, azul marino, crema…)
  - un único color fuerte protagonista
  - armonía entre tonos análogos o combinaciones sobrias
  - calzado que no compita con el top
- Penaliza mezclas como beige + amarillo fuerte + azul eléctrico.

## Recomendación de uso
Cuando añadas prendas, saca la foto con luz natural y fondo sencillo para que el color detectado sea más fiable.

## Despliegue en GitHub Pages
1. Sube todos los archivos a la raíz del repositorio.
2. Ve a `Settings > Pages`.
3. Elige `Deploy from a branch`.
4. Selecciona `main` y `/(root)`.
5. Abre la URL en Safari y añade a pantalla de inicio.
