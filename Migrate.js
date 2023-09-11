// TODO UPDATE MIGRATE TO ADD additionalMigrations files for migrating main package.json etc.
const fs = require('fs');
const path = require('path');

const inputDirectory = 'input-directory'; // Update this with your input directory
const outputDirectory = 'output-directory/vue3'; // Update this with your output directory
const transformationsDirectory = 'transformations'; // Directory containing transformation modules

// Ensure the output directory exists, or create it if necessary
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

// Function to recursively process directories and transform .vue files
function processDirectory(inputDir, outputDir) {
  const items = fs.readdirSync(inputDir);

  items.forEach((item) => {
    const inputItemPath = path.join(inputDir, item);
    const outputItemPath = path.join(outputDir, item);

    if (fs.statSync(inputItemPath).isDirectory()) {
        // If it's a directory, create a corresponding directory in the output
        if (!fs.existsSync(outputItemPath)) {
            fs.mkdirSync(outputItemPath);
        }

        // Recursively process the subdirectory
        processDirectory(inputItemPath, outputItemPath);
    } else if (path.extname(item) === '.vue') {
        // If it's a .vue file, apply transformations and save it in the output directory
        let sourceCode = fs.readFileSync(inputItemPath, 'utf-8');

        // Dynamically load and apply all transformation modules in the transformations directory
        const transformationFiles = fs.readdirSync(transformationsDirectory)
        .filter((file) => path.extname(file) === '.js');

        transformationFiles.forEach((transformationFile) => {
        const transformationModuleName = path.basename(transformationFile, '.js');
        const transformationModule = require(path.join(__dirname, transformationsDirectory, transformationFile));

        // Dynamically call the transformation function based on the module name
        sourceCode = transformationModule[`transform${transformationModuleName}`](sourceCode);
        });

        fs.writeFileSync(outputItemPath, sourceCode);

    }
  });
}

// Start the processing from the root input directory
processDirectory(inputDirectory, outputDirectory);

console.log('Transformation complete.');
