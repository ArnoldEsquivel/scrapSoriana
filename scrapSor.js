const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Configurar Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navegar a la página de inicio de Soriana
    await page.goto('https://www.soriana.com/', { waitUntil: 'networkidle2' });

    // Obtener el enlace del menú de despensa
    const departmentLink = await page.$('a[href="/Despensa"]');

    // Hacer clic en el enlace del menú de despensa
    await departmentLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Obtener todos los enlaces de las categorías
    const categoryLinks = await page.$$('a.nav-link');

    // Crear una lista para almacenar la información de las categorías
    const categoriesList = [];

    // Iterar sobre los enlaces de las categorías y extraer la información de las subcategorías
    for (const categoryLink of categoryLinks) {
        const category = {};
        category.name = await categoryLink.evaluate(node => node.textContent.trim());
        category.url = await categoryLink.evaluate(node => node.href);
        await categoryLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        const subcategoryLinks = await page.$$('a.nav-link');
        const subcategoriesList = [];
        for (const subcategoryLink of subcategoryLinks) {
            const subcategory = {};
            subcategory.name = await subcategoryLink.evaluate(node => node.textContent.trim());
            subcategory.url = await subcategoryLink.evaluate(node => node.href);
            subcategoriesList.push(subcategory);
        }
        category.subcategories = subcategoriesList;
        categoriesList.push(category);
        await page.goBack();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    // Crear el objeto de resultado
    const result = {
        department: 'Despensa',
        url: 'https://www.soriana.com/Despensa',
        categories: categoriesList
    };

    // Escribir el resultado en un archivo JSON
    fs.writeFile('soriana.json', JSON.stringify(result), (err) => {
        if (err) throw err;
        console.log('Archivo guardado correctamente');
    });

    // Cerrar Puppeteer
    await browser.close();
})();