const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const execPromise = util.promisify(exec);

router.post('/pdf', authMiddleware, adminMiddleware, async (req, res) => {
  const { latexContent, filename } = req.body;

  if (!latexContent || !filename) {
    return res.status(400).json({ message: 'LaTeX content and filename are required' });
  }

  // Sanitize filename to prevent path injection
  const safeFilename = path.basename(filename, '.pdf') + '.pdf';
  const tempDir = path.join(__dirname, '../temp');
  const texFile = path.join(tempDir, safeFilename.replace('.pdf', '.tex'));
  const pdfFile = path.join(tempDir, safeFilename.replace('.pdf', '.pdf'));

  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Validate LaTeX content
    if (!latexContent.includes('\\documentclass') || !latexContent.includes('\\begin{document}')) {
      throw new Error('Invalid LaTeX content: Missing document structure');
    }

    fs.writeFileSync(texFile, latexContent);

    const latexCommand = `latexmk -pdf -pdflatex="pdflatex -interaction=nonstopmode" -outdir=${tempDir} ${texFile}`;
    const { stdout, stderr } = await execPromise(latexCommand);

    if (!fs.existsSync(pdfFile)) {
      throw new Error(`PDF file was not generated. LaTeX output: ${stderr}`);
    }

    const pdfData = fs.readFileSync(pdfFile);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
    });
    res.send(pdfData);

    // Clean up
    fs.unlinkSync(texFile);
    fs.unlinkSync(pdfFile);
    const auxFiles = fs.readdirSync(tempDir).filter(file => file.startsWith(safeFilename.replace('.pdf', '')));
    auxFiles.forEach(file => fs.unlinkSync(path.join(tempDir, file)));
  } catch (err) {
    console.error('PDF generation error:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to generate PDF', error: err.message });
  }
});

module.exports = router;