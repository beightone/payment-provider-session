import {
  AuthorizationRequest,
  AuthorizationResponse,
  Authorizations,
  CancellationRequest,
  CancellationResponse,
  Cancellations,
  PaymentProvider,
  RefundRequest,
  RefundResponse,
  Refunds,
  SettlementRequest,
  SettlementResponse,
  Settlements,
} from '@vtex/payment-provider'
import { VBase } from '@vtex/api'

import { randomString } from './utils'
// import { executeAuthorization } from './flow'
import { TreviPayClient } from './treviPayClient'

const authorizationsBucket = 'authorizations'
const persistAuthorizationResponse = async (
  vbase: VBase,
  resp: AuthorizationResponse
) => vbase.saveJSON(authorizationsBucket, resp.paymentId, resp)

const getPersistedAuthorizationResponse = async (
  vbase: VBase,
  req: AuthorizationRequest
) =>
  vbase.getJSON<AuthorizationResponse | undefined>(
    authorizationsBucket,
    req.paymentId,
    true
  )

export default class TreviPayConnector extends PaymentProvider {
  private treviPayClient = new TreviPayClient(this.context, {})

  private async saveAndRetry(
    req: AuthorizationRequest,
    resp: AuthorizationResponse
  ) {
    await persistAuthorizationResponse(this.context.clients.vbase, resp)
    this.callback(req, resp)
  }

  // Create Payment
  public async authorize(
    authorization: AuthorizationRequest
  ): Promise<AuthorizationResponse> {
    if (this.isTestSuite) {
      const persistedResponse = await getPersistedAuthorizationResponse(
        this.context.clients.vbase,
        authorization
      )

      if (persistedResponse !== undefined && persistedResponse !== null) {
        return persistedResponse
      }
    }

    const {
      status: treviPayAuthorizationStatus,
      data: treviPayAuthorizationResult,
    } = await this.treviPayClient.authorizations({
      seller_id: 'SellerA',
      buyer_id: authorization.miniCart.buyer.id ?? '',
      currency: authorization.currency,
      authorized_amount: authorization.value,
    })

    const treviPayTransactionId = randomString()
    const { id, code, message } = treviPayAuthorizationResult

    if (treviPayAuthorizationStatus === 201) {
      return Authorizations.approve(authorization, {
        authorizationId: id,
        code,
        message: message ?? 'Success Transaction',
        tid: treviPayTransactionId,
      })
    }

    return Authorizations.deny(authorization, {
      authorizationId: id,
      code,
      message: message ?? 'Error Transaction',
      tid: treviPayTransactionId,
    })

    // return executeAuthorization(authorization, response =>
    //   this.saveAndRetry(authorization, response)
    // )
    // throw new Error('Not implemented')
  }

  public async cancel(
    cancellation: CancellationRequest
  ): Promise<CancellationResponse> {
    if (this.isTestSuite) {
      return Cancellations.approve(cancellation, {
        cancellationId: randomString(),
      })
    }

    throw new Error('Not implemented')
  }

  public async refund(refund: RefundRequest): Promise<RefundResponse> {
    if (this.isTestSuite) {
      return Refunds.deny(refund)
    }

    throw new Error('Not implemented')
  }

  // Capture Payment
  public async settle(
    settlement: SettlementRequest
  ): Promise<SettlementResponse> {
    if (this.isTestSuite) {
      return Settlements.deny(settlement)
    }

    throw new Error('Not implemented')
  }

  public inbound: undefined
}
