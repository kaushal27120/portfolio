const fs = require('fs');
const path = require('path');

module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  // Cache for 5 minutes on CDN, 1 minute on browser
  res.setHeader('Cache-Control', 'public, s-maxage=300, max-age=60');

  try {
    const photosDir = path.join(process.cwd(), 'photos');
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!fs.existsSync(photosDir)) {
      return res.status(200).json([]);
    }

    const files = fs.readdirSync(photosDir);
    const skip = ['about.jpg','about.jpeg','about.png','about.webp'];

    const photos = files
      .filter(function(file) {
        const ext = path.extname(file).toLowerCase();
        return allowed.includes(ext)
          && !file.startsWith('.')
          && !skip.includes(file.toLowerCase());
      })
      .map(function(file) {
        const fullPath = path.join(photosDir, file);
        const stat = fs.statSync(fullPath);
        const d = new Date(stat.mtime);
        return {
          file: 'photos/' + file,
          date: d.toLocaleString('en', { month: 'short' }) + ' ' + d.getFullYear(),
          mtime: stat.mtime.getTime()
        };
      })
      .sort(function(a, b) { return b.mtime - a.mtime; })
      .map(function(p) { return { file: p.file, date: p.date }; });

    res.status(200).json(photos);

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
