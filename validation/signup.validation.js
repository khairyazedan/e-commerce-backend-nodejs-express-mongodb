const {z} = require('zod');

const signupSchema = z.object({
    userName: z.string().trim()
    .min(3, "user name must be at least 3 characters.")
    .max(20, "user name must be 20 characters or fewer."),
    email: z.string().trim().toLowerCase().email("Invalid email address."),
    password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*(),.?":{}|<>)'
    ),
});


module.exports = signupSchema;