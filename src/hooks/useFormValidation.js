import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';

export function useFormValidation(schema) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((data) => {
    const result = validateForm(schema, data);
    
    if (!result.success) {
      setErrors(result.errors);
      return false;
    }

    setErrors({});
    return true;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(async (data, onSubmit) => {
    if (!validate(data)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      clearErrors();
    } catch (error) {
      setErrors({ 
        _form: error.message || 'حدث خطأ أثناء إرسال النموذج' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, clearErrors]);

  return {
    errors,
    isSubmitting,
    validate,
    clearErrors,
    clearError,
    handleSubmit
  };
}
