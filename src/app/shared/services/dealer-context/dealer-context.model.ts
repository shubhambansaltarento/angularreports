/**
 * The current dealer's identity/context, as it will eventually be supplied by the
 * platform's auth API (per the Multi-Report Framework Specification — dealer details
 * are expected to come from an auth API, mocked here for now since no such API exists
 * yet). Every report prefills its common search parameters from this shape.
 */
export interface DealerContext {
  dealerCode: string;
  dealerName: string;
  dealerDescription: string;
  companyCode: string;
  companyName: string;
}
