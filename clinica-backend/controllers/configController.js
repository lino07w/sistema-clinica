import configService from '../services/configService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class ConfigController {
  // GET /api/configuracion
  get = asyncHandler(async (req, res) => {
    const config = await configService.get();
    successResponse(res, config, 'Configuración obtenida correctamente');
  });

  // PUT /api/configuracion
  update = asyncHandler(async (req, res) => {
    const config = await configService.update(req.body);
    successResponse(res, config, 'Configuración actualizada correctamente');
  });
}

export default new ConfigController();
