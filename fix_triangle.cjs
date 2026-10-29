const fs = require('fs');
let content = fs.readFileSync('src/components/FEASimulation/FEASimulationHub.tsx', 'utf8');

content = content.replace(/TriangleAlert/g, 'AlertTriangle');

fs.writeFileSync('src/components/FEASimulation/FEASimulationHub.tsx', content);
