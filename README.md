# Mi Armario Inteligente v3

Cambios:
- Catálogo de prendas exclusivamente masculino.
- Alta/edición de prendas corregida para Safari/iPhone con guardado explícito.
- Se mantiene el análisis de paleta real desde la foto.
- Las prendas marcadas como no limpias aparecen con TODO el mosaico rojo y la etiqueta PARA LAVAR.
- Compatible con datos de la versión anterior mediante migración visual de categorías antiguas.

- Calzado limitado exclusivamente a zapatillas.
- El generador siempre exige y utiliza zapatillas.


## v5 - alta corregida en iPhone
- Las fotos de cámara se redimensionan a un máximo de 1100 px y se comprimen antes de guardarse.
- Se captura el error de cuota de Safari/localStorage.
- El formulario de alta guarda de forma explícita y no cierra hasta confirmar que los datos se han persistido.
- Service Worker actualizado a v5 para evitar JavaScript antiguo en caché.
