const fs = require('fs');
const filepath = 'src/app/sections/SectionDialog.tsx';
let content = fs.readFileSync(filepath, 'utf8');
content = content.replace('import { ISection, sectionApi } from "@/services/section.api";', 'import sectionApi from "@/services/section.api";\ntype ISection = any;');
fs.writeFileSync(filepath, content);
console.log('Fixed Sections error');
