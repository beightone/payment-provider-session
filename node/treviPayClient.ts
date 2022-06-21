/* eslint-disable no-console */
import { ExternalClient, IOResponse } from '@vtex/api'

export interface TreviPayAuthorize {
  seller_id: string
  buyer_id: string
  currency: string
  authorized_amount: number
  po_number?: number
  notify?: string
}

export interface TreviPayCharge {
  seller_id: string
  buyer_id: string
  currency: string
  total_amount: number
  tax_amount: number
  shipping_amount: number
  shipping_tax_amount: number
  shipping_tax_details: any
  shipping_discount_amount: number
  discount_amount: number
  order_url: string
  order_number: string
  po_number: string
  authorization_id: string
}
export class TreviPayClient extends ExternalClient {
  constructor(context: any, options: any) {
    super('http://trevipay.app/api/v2', context, ...options)
  }

  public authorizations(
    treviPayAuthorizePayload: TreviPayAuthorize
  ): Promise<IOResponse<any>> {
    console.info('treviPayAuthorizePayload', { treviPayAuthorizePayload })

    return this.http.postRaw('/authorizations', treviPayAuthorizePayload)
  }

  public charge(
    treviPayChargePayload: TreviPayCharge
  ): Promise<IOResponse<any>> {
    console.info('treviPayChargePayload', { treviPayChargePayload })

    return this.http.postRaw('/charges', treviPayChargePayload)
  }
}
