# Instrucciones para Agente Colaborador

Bienvenido al proyecto. Esta es tu guía de configuración y flujo de trabajo para asegurar una colaboración sin conflictos.

## 1. Conexión y Repositorio

Este agente debe estar vinculado **exclusivamente** al repositorio principal del proyecto:
`https://github.com/rgarciarojo76-ctrl/risk-analysis`

## 2. Rama de Trabajo Obligatoria

**NO DEBES TRABAJAR EN LA RAMA MAIN.**
Es obligatorio que crees y uses exclusivamente la rama designada para tu trabajo:
`dev-colaborador`

Comandos iniciales sugeridos:
\`\`\`bash
git fetch origin
git checkout -b dev-colaborador origin/main
\`\`\`

## 3. Entorno de Desarrollo

Asegúrate de instalar todas las dependencias necesarias antes de iniciar el trabajo:

- **Node.js (Frontend):**
  \`\`\`bash
  npm install
  \`\`\`
- **Python (Si aplica según los requerimientos del entorno virtual):**
  \`\`\`bash
  pip install -r requirements.txt
  \`\`\`

## 4. Despliegue Local (Previsualización)

Para levantar el entorno de desarrollo y verificar tus cambios localmente, utiliza (si está configurada la Vercel CLI):
\`\`\`bash
vercel dev
\`\`\`
_(Alternativamente, usa `npm run dev` si la Vercel CLI no está inicializada)._

## 5. Sincronización y Subida Automática (Git)

Cada vez que realices un avance significativo y el código esté estable, debes sincronizar tus cambios automáticamente en tu rama de trabajo:

\`\`\`bash
git add .
git commit -m "feat/fix: descripción del cambio"
git push origin dev-colaborador
\`\`\`

---

_Nota: Sigue estas instrucciones estrictamente para evitar sobrescribir el trabajo de la rama principal (`main`)._
