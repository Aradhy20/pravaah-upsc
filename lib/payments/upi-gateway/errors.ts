export class UpiGatewayError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = "GATEWAY_ERROR", statusCode = 500) {
    super(message);
    this.name = "UpiGatewayError";
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UpiGatewayApiError extends UpiGatewayError {
  public readonly responseBody?: any;

  constructor(message: string, statusCode = 502, responseBody?: any) {
    super(message, "GATEWAY_API_ERROR", statusCode);
    this.name = "UpiGatewayApiError";
    this.responseBody = responseBody;
  }
}

export class UpiGatewayNetworkError extends UpiGatewayError {
  constructor(message: string) {
    super(message, "GATEWAY_NETWORK_TIMEOUT", 504);
    this.name = "UpiGatewayNetworkError";
  }
}

export class WebhookVerificationError extends UpiGatewayError {
  constructor(message: string) {
    super(message, "INVALID_WEBHOOK_SIGNATURE", 401);
    this.name = "WebhookVerificationError";
  }
}

export class OrderNotFoundError extends UpiGatewayError {
  constructor(orderId: string) {
    super(`Order ${orderId} not found`, "ORDER_NOT_FOUND", 404);
    this.name = "OrderNotFoundError";
  }
}
