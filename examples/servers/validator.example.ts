/**
 * Examples of using the new Validator system (Zod-like but better)
 */

import { AzuraClient } from "../../package/src/infra/Server";
import { v, ValidationError, type Infer } from "../../package/src/utils/validators/Validator";

const app = new AzuraClient();

// ============================================
// Example 1: Basic validation
// ============================================

const userSchema = v.object({
  name: v.string().min(3).max(50),
  email: v.string().email(),
  age: v.number().int().positive().min(18),
  active: v.boolean().optional().default(true),
});

app.post("/users", (req, res) => {
  try {
    const userData = userSchema.parse(req.body);

    // userData is type-safe!
    const user = createUser(userData);
    res.json({ success: true, user, message: "User created successfully" });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: "Validation failed",
        issues: error.format(),
      });
    }
    res.status(500).json({ error: "Internal error" });
  }
});

// ============================================
// Example 2: Type inference
// ============================================

const productSchema = v.object({
  name: v.string().min(1),
  price: v.number().positive(),
  category: v.enum(["electronics", "clothing", "food"] as const),
  tags: v.array(v.string()).optional(),
  inStock: v.boolean(),
});

// Automatic type inference!
type Product = Infer<typeof productSchema>;
// Result: { name: string; price: number; category: 'electronics' | 'clothing' | 'food'; tags?: string[]; inStock: boolean }

app.post("/products", (req, res) => {
  const result = productSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: result.error.format(),
    });
  }

  const product: Product = result.data;
  res.json(product);
});

// ============================================
// Example 3: Nested objects
// ============================================

const addressSchema = v.object({
  street: v.string(),
  city: v.string(),
  zipCode: v.string().regex(/^\d{5}(-\d{4})?$/),
  country: v.string().default("US"),
});

const customerSchema = v.object({
  name: v.string(),
  email: v.string().email(),
  address: addressSchema,
  shippingAddress: addressSchema.optional(),
});

app.post("/customers", (req, res) => {
  try {
    const customer = customerSchema.parse(req.body);
    res.json(customer);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ errors: error.format() });
    }
  }
});

// ============================================
// Example 4: Custom validations
// ============================================

const passwordSchema = v
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
  .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
  .refine((val) => /[0-9]/.test(val), "Password must contain at least one number");

const registerSchema = v
  .object({
    username: v.string().min(3).max(20),
    email: v.string().email(),
    password: passwordSchema,
    confirmPassword: v.string(),
  })
  .refine((data) => data.password === data.confirmPassword, "Passwords do not match");

app.post("/register", (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.error.format(),
    });
  }

  const { username, email, password } = result.data;
  // Register user...
  res.json({ success: true, data: { username, email } });
});

// ============================================
// Example 5: Arrays and complex structures
// ============================================

const commentSchema = v.object({
  text: v.string().min(1).max(500),
  author: v.string(),
  createdAt: v.date(),
});

const postSchema = v.object({
  title: v.string().min(1).max(200),
  content: v.string().min(10),
  tags: v.array(v.string()).min(1).max(10),
  comments: v.array(commentSchema).optional(),
  published: v.boolean().default(false),
  publishedAt: v.date().optional(),
});

app.post("/posts", (req, res) => {
  const result = postSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.message,
      issues: result.error.errors,
    });
  }

  res.json(result.data);
});

// ============================================
// Example 6: Partial and Pick
// ============================================

const updateUserSchema = userSchema.partial(); // All fields optional

app.patch("/users/:id", (req, res) => {
  const updates = updateUserSchema.parse(req.body);
  // Update only provided fields
  res.json(updates);
});

// Login schema separate (since password is not in userSchema)
const loginSchema = v.object({
  email: v.string().email(),
  password: v.string().min(8),
});

app.post("/login", (req, res) => {
  const credentials = loginSchema.parse(req.body);
  // Only { email, password }
  res.json(credentials);
});

// ============================================
// Example 7: Union types
// ============================================

const paymentSchema = v.union(
  v.object({
    type: v.literal("card"),
    cardNumber: v.string().length(16),
    cvv: v.string().length(3),
  }),
  v.object({
    type: v.literal("paypal"),
    email: v.string().email(),
  }),
  v.object({
    type: v.literal("crypto"),
    walletAddress: v.string(),
  })
);

app.post("/payment", (req, res) => {
  const payment = paymentSchema.parse(req.body) as any;

  // TypeScript knows about all union variants!
  if (payment.type === "card") {
    // payment.cardNumber is available
  } else if (payment.type === "paypal") {
    // payment.email is available
  }

  res.json(payment);
});

// ============================================
// Example 8: String transformations
// ============================================

const searchSchema = v.object({
  query: v.string().trim().toLowerCase().min(1),
  category: v.string().optional(),
  page: v.number().int().positive().default(1),
  limit: v.number().int().positive().max(100).default(20),
});

app.get("/search", (req, res) => {
  const params = searchSchema.parse(req.query);

  // params.query is automatically trimmed and lowercased!
  res.json({
    query: params.query,
    page: params.page,
    limit: params.limit,
  });
});

// ============================================
// Example 9: Middleware for validation
// ============================================

function validate<T>(schema: any) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: result.error.format(),
      });
    }

    req.validated = result.data;
    next();
  };
}

app.post("/api/users", validate(userSchema), (req, res) => {
  const userData = (req as any).validated; // Already validated!
  res.json(userData);
});

// ============================================
// Example 10: Global error handler
// ============================================

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Validate response before sending (optional)
    return originalJson(data);
  };

  next();
});

// Error handling middleware
function errorHandler(error: any, req: any, res: any, next: any) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: "Validation Error",
      message: error.message,
      issues: error.format(),
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: error.message,
  });
}

// ============================================
// Example 11: Advanced patterns
// ============================================

// Conditional validation
const orderSchema = v
  .object({
    type: v.enum(["pickup", "delivery"] as const),
    items: v.array(
      v.object({
        productId: v.string(),
        quantity: v.number().int().positive(),
      })
    ),
    // Address required only for delivery
    address: v
      .object({
        street: v.string(),
        city: v.string(),
      })
      .optional(),
  })
  .refine(
    (data) => (data.type === "delivery" ? !!data.address : true),
    "Address is required for delivery orders"
  );

// Dependent fields
const promoSchema = v
  .object({
    code: v.string(),
    discountType: v.enum(["percentage", "fixed"] as const),
    discountValue: v.number().positive(),
  })
  .refine((data) => {
    if (data.discountType === "percentage") {
      return data.discountValue <= 100;
    }
    return true;
  }, "Percentage discount cannot exceed 100%");

// ============================================
// Helper functions
// ============================================

function createUser(data: any) {
  return { id: "123", ...data };
}

export { app };
