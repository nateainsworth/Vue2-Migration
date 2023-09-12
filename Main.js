const fs = require('fs');
const path = require('path');

// Define paths to Vue 2 project directories
const projectRoot = '/path/to/vue2/project'; // Update with your project root

// Define the input files which will be migrated
const inputDirectories = [
  path.join(projectRoot, 'components'),
  path.join(projectRoot, 'pages'),
  path.join(projectRoot, 'layouts'),
  path.join(projectRoot, 'views'),
];

// Define corresponding output directories
const outputDirectories = [
  path.join(projectRoot, 'componentsV3'),
  path.join(projectRoot, 'pagesV3'),
  path.join(projectRoot, 'layoutsV3'),
  path.join(projectRoot, 'viewsV3'),
];

// Ensure output directories exist or create them if necessary
outputDirectories.forEach((outputDir) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
});

let totalChanges = 0; // Initialize a counter for total changes
let totalErrors = 0; // Initialize a counter for total errors

// Function to recursively process directories and transform .vue files
function processDirectory(inputDir, outputDir) {
  const items = fs.readdirSync(inputDir);

  items.forEach((item) => {
    const inputItemPath = path.join(inputDir, item);
    const outputItemPath = path.join(outputDir, item);

    if (fs.statSync(inputItemPath).isDirectory()) {
      // If it's a directory, create a corresponding directory in the output
      if (!fs.existsSync(outputItemPath)) {
        fs.mkdirSync(outputItemPath, { recursive: true });
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

        try {
          // Dynamically call the transformation function based on the module name
          const { transformedCode, changeCount, error } = transformationModule[`transform${transformationModuleName}`](sourceCode);
          
          if (error) {
            console.error(`Error in ${transformationModuleName} while processing ${inputItemPath}: ${error.message}`);
            totalErrors++;
          } else {
            sourceCode = transformedCode;
            totalChanges += changeCount;
          }
        } catch (error) {
          console.error(`Error in ${transformationModuleName} while processing ${inputItemPath}: ${error.message}`);
          totalErrors++;
        }
      });

      // Save the final version of the file
      fs.writeFileSync(outputItemPath, sourceCode);
    }
  });
}

// Loop through input and output directories
for (let i = 0; i < inputDirectories.length; i++) {
  const inputDir = inputDirectories[i];
  const outputDir = outputDirectories[i];

  // Start processing from the specified input directory
  processDirectory(inputDir, outputDir);

  console.log(`Transformation complete for ${inputDir}`);
}

console.log(`Total changes: ${totalChanges}, Total errors: ${totalErrors}`);
