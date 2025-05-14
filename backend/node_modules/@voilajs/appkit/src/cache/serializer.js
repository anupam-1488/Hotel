/**
 * @voilajs/appkit - Cache value serializer
 * @module @voilajs/appkit/cache/serializer
 */

/**
 * Creates a serializer for cache values
 * @param {Object} [options] - Serializer options
 * @returns {Object} Serializer with serialize/deserialize methods
 */
export function createSerializer(options = {}) {
  return {
    /**
     * Serialize a value to string
     * @param {any} value - Value to serialize
     * @returns {string} Serialized value
     * @throws {Error} If serialization fails
     */
    serialize(value) {
      try {
        return JSON.stringify(value);
      } catch (error) {
        throw new Error(`Failed to serialize value: ${error.message}`);
      }
    },

    /**
     * Deserialize a string to value
     * @param {string} data - Serialized data
     * @returns {any} Deserialized value
     * @throws {Error} If deserialization fails
     */
    deserialize(data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        throw new Error(`Failed to deserialize value: ${error.message}`);
      }
    },
  };
}
