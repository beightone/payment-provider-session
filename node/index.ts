import { PaymentProviderService } from '@vtex/payment-provider'

import TreviPayConnector from './connector'

export default new PaymentProviderService({
  connector: TreviPayConnector,
})
