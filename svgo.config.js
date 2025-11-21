module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          convertPathData: {
            floatPrecision: 1
          },
          convertTransform: {
            floatPrecision: 1
          },
          cleanupNumericValues: {
            floatPrecision: 1
          }
        }
      }
    },
    'removeDimensions',
    'removeMetadata',
    'removeComments',
    'removeDesc',
    'removeTitle',
    'removeDoctype',
    'removeXMLProcInst',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeUnknownsAndDefaults',
    'removeUnusedNS',
    'removeUselessDefs',
    'removeUselessStrokeAndFill',
    'removeEmptyContainers',
    'removeEmptyText',
    'removeNonInheritableGroupAttrs',
    'removeOffCanvasPaths',
    'reusePaths',
    'sortAttrs',
    'sortDefsChildren'
  ]
};




