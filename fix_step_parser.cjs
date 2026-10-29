const fs = require('fs');
let content = fs.readFileSync('src/components/FEASimulation/cadModelParser.ts', 'utf8');

// Add isProxyGeometry to interface
content = content.replace(
  '  protocol?: string;',
  '  protocol?: string;\n  isProxyGeometry?: boolean;'
);

// Add isProxyGeometry: true to parseSTEPFile return
content = content.replace(
  '    availableFaces,\n  };\n}',
  '    availableFaces,\n    isProxyGeometry: true,\n  };\n}'
);

fs.writeFileSync('src/components/FEASimulation/cadModelParser.ts', content);
