# Skulpt Local Files

To make the application work offline, you need to download the Skulpt libraries and place them in this directory.

## Download Instructions:

1. Download `skulpt.min.js` from: https://skulpt.org/js/skulpt.min.js
2. Download `skulpt-stdlib.js` from: https://skulpt.org/js/skulpt-stdlib.js
3. Place both files in this `/public/skulpt/` directory

## File Structure:
```
/public/skulpt/
├── skulpt.min.js
├── skulpt-stdlib.js
└── README.md (this file)
```

The application will first try to load these local files, and fallback to CDN if they're not available.
