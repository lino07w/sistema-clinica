import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { configAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { configSchema } from '../schemas/configSchema';
import Navbar from '../components/Navbar';
import ContentWrapper from '../components/ContentWrapper';
import Spinner from '../components/Spinner';
import '../styles/Page.css';

const FIELDS = ['nombreClinica', 'direccion', 'telefono', 'email', 'horarioAtencion'];

/** Toma sólo los campos editables (el backend devuelve también id, fechas, etc.). */
const pickFields = (config = {}) =>
  Object.fromEntries(FIELDS.map((field) => [field, config[field] ?? '']));

const Configuracion = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(configSchema) });

  const cargarConfig = useCallback(async () => {
    try {
      const response = await configAPI.get();
      reset(pickFields(response.data?.data));
    } catch (error) {
      console.error('Error cargando configuración:', error);
      addToast('No se pudo cargar la configuración.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, reset]);

  useEffect(() => {
    cargarConfig();
  }, [cargarConfig]);

  const onSubmit = async (data) => {
    try {
      const response = await configAPI.update(data);
      reset(pickFields(response.data?.data ?? data));
      addToast('Cambios guardados', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'No se pudieron guardar los cambios.', 'error');
    }
  };

  const fieldProps = (name) => ({
    id: `cfg-${name}`,
    className: 'field-input',
    'aria-invalid': Boolean(errors[name]),
    ...register(name),
  });

  return (
    <>
      <Navbar />
      <ContentWrapper>
        <main className="page page-narrow">
          <div className="page-header">
            <div>
              <h1 className="page-title">Configuración</h1>
              <p className="page-subtitle">Datos de la clínica que aparecen en reportes y correos.</p>
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <form className="panel" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="field">
                <label className="field-label" htmlFor="cfg-nombreClinica">Nombre de la clínica</label>
                <input type="text" {...fieldProps('nombreClinica')} />
                {errors.nombreClinica && <span className="field-error">{errors.nombreClinica.message}</span>}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="cfg-direccion">Dirección</label>
                <input type="text" autoComplete="street-address" {...fieldProps('direccion')} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="cfg-telefono">Teléfono</label>
                  <input type="tel" {...fieldProps('telefono')} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="cfg-email">Email de contacto</label>
                  <input type="email" {...fieldProps('email')} />
                  {errors.email && <span className="field-error">{errors.email.message}</span>}
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="cfg-horarioAtencion">Horario de atención</label>
                <input type="text" placeholder="Lunes a viernes, 08:00 a 20:00" {...fieldProps('horarioAtencion')} />
              </div>

              <div className="form-footer">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </main>
      </ContentWrapper>
    </>
  );
};

export default Configuracion;
