import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صالح'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'الاسم مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم لا يمكن أن يتجاوز 100 حرف'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صالح'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'
    ),
  confirmPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور مطلوب'),
  phone: z
    .string()
    .optional()
    .regex(/^\+?[\d\s-]{10,}$/, 'رقم الهاتف غير صالح'),
  role: z
    .enum(['student', 'teacher'])
    .default('student')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword']
});

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .regex(/^\+?[\d\s-]{10,}$/, 'رقم الهاتف غير صالح'),
  message: z
    .string()
    .min(1, 'الرسالة مطلوبة')
    .min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل')
    .max(1000, 'الرسالة لا يمكن أن تتجاوز 1000 حرف')
});

export const studentSchema = z.object({
  name: z
    .string()
    .min(1, 'اسم الطالب مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  plan: z
    .string()
    .min(1, 'الخطة مطلوبة'),
  currentSurah: z
    .string()
    .min(1, 'السورة الحالية مطلوبة'),
  homework: z
    .string()
    .optional()
});

export const updateStudentSchema = z.object({
  progress: z
    .number()
    .min(0, 'التقدم لا يمكن أن يكون سالب')
    .max(100, 'التقدم لا يمكن أن يتجاوز 100'),
  currentSurah: z
    .string()
    .min(1, 'السورة مطلوبة'),
  lastGrade: z
    .string()
    .min(1, 'الدرجة مطلوبة'),
  homework: z
    .string()
    .optional()
});

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم لا يمكن أن يتجاوز 100 حرف'),
  phone: z
    .string()
    .optional()
    .regex(/^\+?[\d\s-]{10,}$/, 'رقم الهاتف غير صالح'),
  bio: z
    .string()
    .max(500, 'النبذة لا يمكن أن تتجاوز 500 حرف')
    .optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmNewPassword']
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صالح')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmNewPassword']
});

export const liveSessionSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان الحصة مطلوب')
    .min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل')
    .max(200, 'العنوان لا يمكن أن يتجاوز 200 حرف'),
  description: z
    .string()
    .max(1000, 'الوصف لا يمكن أن يتجاوز 1000 حرف')
    .optional(),
  subject: z
    .string()
    .optional()
});

export const chatMessageSchema = z.object({
  text: z
    .string()
    .min(1, 'الرسالة مطلوبة')
    .max(2000, 'الرسالة لا يمكن أن تتجاوز 2000 حرف')
});

export function validateForm(schema, data) {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0];
        if (!errors[field]) {
          errors[field] = error.message;
        }
      });
      return { success: false, errors };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { 
      success: false, 
      errors: { _form: 'حدث خطأ في التحقق من البيانات' } 
    };
  }
}
