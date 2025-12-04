/**
 * Utilidades para manejo de archivos JSON
 * Simula una base de datos con archivos JSON
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileStorage {
  constructor(dataPath = './data') {
    this.dataPath = path.join(path.dirname(__dirname), dataPath);
    this.initializeStorage();
  }

  /**
   * Inicializa el directorio de datos
   */
  async initializeStorage() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
      // Crear archivos iniciales vacíos
      await this.write('usuarios', []);
      await this.write('pacientes', []);
      await this.write('medicos', []);
      await this.write('citas', []);
    }
  }

  /**
   * Lee datos de un archivo
   */
  async read(collection) {
    try {
      const filePath = path.join(this.dataPath, `${collection}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Si el archivo no existe, crearlo con array vacío
        await this.write(collection, []);
        return [];
      }
      throw error;
    }
  }

  /**
   * Escribe datos en un archivo
   */
  async write(collection, data) {
    try {
      const filePath = path.join(this.dataPath, `${collection}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error escribiendo en ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Busca un elemento por ID
   */
  async findById(collection, id) {
    const data = await this.read(collection);
    return data.find(item => item.id === id);
  }

  /**
   * Busca elementos con un filtro
   */
  async find(collection, filter = {}) {
    const data = await this.read(collection);
    
    if (Object.keys(filter).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (typeof value === 'string') {
          return item[key]?.toLowerCase().includes(value.toLowerCase());
        }
        return item[key] === value;
      });
    });
  }

  /**
   * Busca un elemento con un filtro
   */
  async findOne(collection, filter) {
    const data = await this.read(collection);
    return data.find(item => {
      return Object.entries(filter).every(([key, value]) => item[key] === value);
    });
  }

  /**
   * Crea un nuevo elemento
   */
  async create(collection, item) {
    const data = await this.read(collection);
    
    // Generar ID si no existe
    if (!item.id) {
      item.id = this.generateId();
    }
    
    // Agregar timestamps
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    
    data.push(item);
    await this.write(collection, data);
    
    return item;
  }

  /**
   * Actualiza un elemento por ID
   */
  async updateById(collection, id, updates) {
    const data = await this.read(collection);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Actualizar y mantener createdAt
    data[index] = {
      ...data[index],
      ...updates,
      id, // Mantener el ID original
      createdAt: data[index].createdAt, // Mantener fecha de creación
      updatedAt: new Date().toISOString()
    };
    
    await this.write(collection, data);
    return data[index];
  }

  /**
   * Elimina un elemento por ID
   */
  async deleteById(collection, id) {
    const data = await this.read(collection);
    const filtered = data.filter(item => item.id !== id);
    
    if (filtered.length === data.length) {
      return null; // No se encontró el elemento
    }
    
    await this.write(collection, filtered);
    return true;
  }

  /**
   * Cuenta elementos en una colección
   */
  async count(collection, filter = {}) {
    const items = await this.find(collection, filter);
    return items.length;
  }

  /**
   * Genera un ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Limpia una colección
   */
  async clear(collection) {
    await this.write(collection, []);
    return true;
  }
}

// Exportar instancia singleton
const storage = new FileStorage();

export default storage;
