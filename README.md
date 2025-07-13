# Code Golf Visualizer

A web application for visualizing code golf challenges and performance metrics with real-time code execution and data visualization.

## Features

- Interactive code editor with Monaco Editor
- Multiple programming language support
- Real-time performance metrics and visualization
- Code golf challenges with test cases
- Responsive design with modern UI

## Development Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd code-golf-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

- **Start development server**: `npm run serve`
  - Starts webpack dev server with hot reload
  - Opens browser automatically at http://localhost:3000

- **Build for development**: `npm run dev`
  - Creates unminified build in `dist/` folder

- **Build for production**: `npm run build`
  - Creates optimized, minified build in `dist/` folder
  - CSS is extracted and minified
  - JavaScript is minified with console statements removed
  - Files are hashed for cache busting

- **Watch mode**: `npm run watch`
  - Rebuilds automatically when files change

- **Clean build folder**: `npm run clean`
  - Removes the `dist/` folder

### Webpack Configuration

The project uses Webpack 5 with the following optimizations:

#### CSS Optimization
- **MiniCssExtractPlugin**: Extracts CSS into separate files in production
- **CssMinimizerPlugin**: Minifies CSS with advanced optimizations:
  - Removes comments and whitespace
  - Optimizes colors and values
  - Merges duplicate rules
  - Minifies gradients and font values
  - SVG optimization

#### JavaScript Optimization
- **TerserPlugin**: Minifies JavaScript code
- **Code splitting**: Separates vendor code from application code
- **Tree shaking**: Removes unused code

#### Development Features
- **Hot Module Replacement**: Updates code without full page reload
- **Source maps**: For debugging in development
- **Dev server**: Live reloading development server

### File Structure

```
src/
├── index.html          # Main HTML template
├── index.js           # Webpack entry point
├── styles.css         # Main stylesheet
└── script.js          # Main JavaScript logic

dist/                  # Build output (generated)
├── index.html         # Processed HTML
├── [hash].css         # Minified CSS bundle
└── [hash].js          # Minified JS bundle

webpack.config.js      # Webpack configuration
package.json          # Dependencies and scripts
```

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features are used
- CSS Grid and Flexbox layouts

### Performance

The production build includes:
- CSS minification with ~30-50% size reduction
- JavaScript minification with ~40-60% size reduction
- Gzip compression support
- Cache-busting with content hashes
- Vendor code splitting for better caching

## License

MIT License
