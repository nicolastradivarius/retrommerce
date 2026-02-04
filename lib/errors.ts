/**
 * Clases de error personalizadas para la aplicación.
 * Permiten manejo de errores type-safe y consistente.
 */

/**
 * Error base de la aplicación.
 * Todos los errores personalizados heredan de esta clase.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================================
// Errores de Autenticación y Autorización
// ============================================================================

/**
 * Error cuando el usuario no está autenticado.
 * Status code: 401
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * Error cuando el usuario no tiene permisos para realizar la acción.
 * Status code: 403
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

// ============================================================================
// Errores de Recursos No Encontrados
// ============================================================================

/**
 * Error base para recursos no encontrados.
 * Status code: 404
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Error cuando un producto no existe.
 */
export class ProductNotFoundError extends NotFoundError {
  constructor(message: string = "Product not found") {
    super(message);
  }
}

/**
 * Error cuando un item del carrito no existe.
 */
export class CartItemNotFoundError extends NotFoundError {
  constructor(message: string = "Cart item not found") {
    super(message);
  }
}

/**
 * Error cuando un usuario no existe.
 */
export class UserNotFoundError extends NotFoundError {
  constructor(message: string = "User not found") {
    super(message);
  }
}

// ============================================================================
// Errores de Validación y Lógica de Negocio
// ============================================================================

/**
 * Error base para validaciones.
 * Status code: 400
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Error cuando no hay suficiente stock disponible.
 * Incluye información sobre stock disponible y cantidad solicitada.
 */
export class InsufficientStockError extends ValidationError {
  constructor(
    public availableStock: number,
    public requestedQuantity: number,
  ) {
    super(
      `Insufficient stock. Available: ${availableStock}, requested: ${requestedQuantity}`,
    );
  }
}

/**
 * Error cuando la cantidad es inválida (ej: negativa, cero, no numérica).
 */
export class InvalidQuantityError extends ValidationError {
  constructor(message: string = "Invalid quantity") {
    super(message);
  }
}

/**
 * Error cuando falta un campo requerido.
 */
export class MissingFieldError extends ValidationError {
  constructor(fieldName: string) {
    super(`Field '${fieldName}' is required`);
  }
}

/**
 * Error cuando un campo tiene un formato inválido.
 */
export class InvalidFormatError extends ValidationError {
  constructor(fieldName: string, expectedFormat?: string) {
    const message = expectedFormat
      ? `Field '${fieldName}' has invalid format. Expected: ${expectedFormat}`
      : `Field '${fieldName}' has invalid format`;
    super(message);
  }
}
