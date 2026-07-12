declare module "midtrans-client" {
  interface MidtransClientConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  interface TransactionStatusResponse {
    transaction_id: string;
    order_id: string;
    transaction_status: string;
    fraud_status?: string;
    payment_type?: string;
    gross_amount: string;
    status_code: string;
    [key: string]: unknown;
  }

  class Snap {
    constructor(config: MidtransClientConfig);
    createTransaction(parameter: Record<string, unknown>): Promise<SnapTransactionResponse>;
  }

  class CoreApi {
    constructor(config: MidtransClientConfig);
    transaction: {
      status(orderId: string): Promise<TransactionStatusResponse>;
      notification(payload: unknown): Promise<TransactionStatusResponse>;
    };
  }

  const midtransClient: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default midtransClient;
}
