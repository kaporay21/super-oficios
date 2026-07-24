const Jimp = require('jimp');

async function removeBackground(imagePath, outputPath) {
  try {
    const image = await Jimp.read(imagePath);
    
    // Asumimos que el color en la esquina superior izquierda es el color de fondo a remover
    const bgColor = image.getPixelColor(0, 0);
    const bgRGBA = Jimp.intToRGBA(bgColor);

    // Iteramos sobre todos los píxeles
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Si el píxel es muy cercano al color de fondo (blanco/gris claro), lo hacemos transparente
      const tolerance = 25; 
      
      if (
        Math.abs(red - bgRGBA.r) <= tolerance &&
        Math.abs(green - bgRGBA.g) <= tolerance &&
        Math.abs(blue - bgRGBA.b) <= tolerance
      ) {
        this.bitmap.data[idx + 3] = 0; // Canal Alpha a 0 (Transparente)
      }
    });

    await image.writeAsync(outputPath);
    console.log("Fondo removido con éxito: " + outputPath);
  } catch (err) {
    console.error("Error procesando imagen:", err);
  }
}

removeBackground('./public/support_worker_3d.png', './public/support_worker_transparent.png');
