import type { GenderedPricing, TicketGender, TicketType } from './types';

export function unitPriceKobo(pricing: GenderedPricing, gender: TicketGender, quantity: number) {
  if (gender === 'female') {
    return quantity > 1 ? pricing.femaleMultiKobo : pricing.femaleKobo;
  }
  return pricing.maleKobo;
}

export function lineTotalKobo(ticket: TicketType, gender: TicketGender, quantity: number) {
  return unitPriceKobo(ticket.pricing, gender, quantity) * quantity;
}

export function lowestTicketPrice(ticketTypes: TicketType[]) {
  const open = ticketTypes.filter((t) => t.remaining > 0);
  const source = open.length > 0 ? open : ticketTypes;
  return Math.min(...source.map((t) => t.pricing.femaleMultiKobo));
}

export function genderLabel(gender: TicketGender) {
  return gender === 'female' ? 'Girls' : 'Guys';
}
