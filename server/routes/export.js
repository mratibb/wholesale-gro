const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Export LaTeX to PDF
router.post('/pdf', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { latexContent, filename } = req.body;
    if (!latexContent || !filename) {
      return res.status(400).json({ message: 'LaTeX content and filename are required' });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const texFilePath = path.join(tempDir, `${filename.replace('.pdf', '')}.tex`);
    const pdfFilePath = path.join(tempDir, filename);

    // Writing LaTeX content to a .tex file
    fs.writeFileSync(texFilePath, latexContent);

    // Compiling LaTeX to PDF using latexmk
    execSync(`latexmk -pdf -outdir="${tempDir}" "${texFilePath}"`, { stdio: 'inherit' });

    // Reading the generated PDF
    const pdfBuffer = fs.readFileSync(pdfFilePath);

    // Cleaning up temporary files
    fs.unlinkSync(texFilePath);
    fs.unlinkSync(pdfFilePath);
    ['aux', 'log', 'fdb_latexmk', 'fls'].forEach((ext) => {
      const tempFile = path.join(tempDir, `${filename.replace('.pdf', '')}.${ext}`);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router;