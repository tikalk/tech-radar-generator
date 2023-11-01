const path = require("path");

const { cloneDeep } = require("lodash");
const webpack = require("webpack");
const Ajv = require("ajv");

const schema = require("./schema.json");
const baseConfig = require("./webpack.config");

const ajv = new Ajv({ allErrors: true });

/**
 * Throw an error if the radar data is invalid
 * @private
 * @param {object} data The data for the radar
 */
function validate(data) {
  const valid = ajv.validate(schema, data);
  if (!valid) {
    throw new Error(`Config did not match JSON schema: ${ajv.errorsText()}`);
  }
}

/**
 * A promise-generating form of Webpack
 * @private
 * @param {object} config The webpack config
 * @return {Promise<void>}
 */
const build = (config) =>
  new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err || stats.hasErrors()) {
        reject(err || stats.toString({ colors: true }));
      } else {
        resolve();
      }
    });
  });

/**
 * @typedef RadarOptions
 * @property {('development'|'production')} [mode="production"] The webpack mode
 */

/**
 * Generates a static Thoughtworks Radar.
 * @param {object} data The data for the radar
 * @param {string} outputArg The relative or absolute path to the output directory
 * @param {RadarOptions} [options] The radar options
 * @return {Promise<string>} A promise resolving to the output directory path
 */
async function techRadarGenerator(
  data,
  outputArg,
  { mode = "production" } = {}
) {
  validate(data);

  const outputPath = path.resolve(outputArg);
  const config = cloneDeep(baseConfig);
  config.mode = mode;
  config.output.path = outputPath;
  const valLoader = config.module.rules.find(
    (el) => el.loader === require.resolve("val-loader")
  );

  valLoader.options.data = data;

  await build(config);

  return outputPath;
}

module.exports = techRadarGenerator;
