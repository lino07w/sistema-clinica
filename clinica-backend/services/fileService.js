/**
 * Servicio para leer y escribir archivos JSON
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Lee un archivo JSON y retorna su contenido parseado
 * @param {string} filepath - Ruta del archivo
 * @returns {Promise<any>} Contenido del archivo parseado
 */
export const readJSON = async (filepath) => {
  const fullPath = path.resolve(filepath);
  
  try {
    const data = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Si el archivo no existe, retornar array vacío
      return [];
    }
    throw new Error(`Error al leer archivo JSON ${filepath}: ${error.message}`);
  }
};

/**
 * Escribe datos en un archivo JSON
 * @param {string} filepath - Ruta del archivo
 * @param {any} data - Datos a escribir
 * @returns {Promise<void>}
 */
export const writeJSON = async (filepath, data) => {
  const fullPath = path.resolve(filepath);
  const jsonData = JSON.stringify(data, null, 2);
  
  // Asegurar que el directorio existe
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  
  await fs.writeFile(fullPath, jsonData, 'utf-8');
};

/**
 * Verifica si un archivo existe
 * @param {string} filepath - Ruta del archivo
 * @returns {Promise<boolean>}
 */
export const fileExists = async (filepath) => {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Lee un archivo de texto
 * @param {string} filepath - Ruta del archivo
 * @returns {Promise<string>}
 */
export const readFile = async (filepath) => {
  const fullPath = path.resolve(filepath);
  return await fs.readFile(fullPath, 'utf-8');
};

/**
 * Escribe un archivo de texto
 * @param {string} filepath - Ruta del archivo
 * @param {string} content - Contenido a escribir
 * @returns {Promise<void>}
 */
export const writeFile = async (filepath, content) => {
  const fullPath = path.resolve(filepath);
  
  // Asegurar que el directorio existe
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  
  await fs.writeFile(fullPath, content, 'utf-8');
};

export default {
  readJSON,
  writeJSON,
  fileExists,
  readFile,
  writeFile
};
 