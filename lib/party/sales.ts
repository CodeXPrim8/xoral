import {
  getPerson,
  listSellers,
  listVendors,
  salesForPerson,
  salesForVendorTeam,
} from './store';
import type { SalesPerson } from './types';
import {
  BONUS_75,
  BONUS_100,
  BONUS_100_KOBO,
  BONUS_TOP_KOBO,
  COMMISSION_RATE,
  PERSON_TARGET,
  TEAM_MIN,
  TEAM_TARGET,
  currentMilestone,
} from './sales-config';

export {
  BONUS_100,
  BONUS_100_KOBO,
  BONUS_75,
  BONUS_TOP_KOBO,
  COMMISSION_RATE,
  MILESTONES,
  PERSON_TARGET,
  TEAM_MIN,
  TEAM_TARGET,
  commissionKobo,
  currentMilestone,
} from './sales-config';

function saleAmount(sale: { amountKobo?: number; commissionKobo: number }) {
  if (sale.amountKobo && sale.amountKobo > 0) return sale.amountKobo;
  return Math.round(sale.commissionKobo / COMMISSION_RATE);
}

function sumAttendees(personId: string) {
  return salesForPerson(personId).reduce((sum, sale) => sum + sale.attendees, 0);
}

function sumCommission(personId: string) {
  return salesForPerson(personId).reduce((sum, sale) => sum + sale.commissionKobo, 0);
}

function sumAmount(personId: string) {
  return salesForPerson(personId).reduce((sum, sale) => sum + saleAmount(sale), 0);
}

export function topVendorId() {
  const ranked = listVendors()
    .map((vendor) => ({
      id: vendor.id,
      attendees: salesForVendorTeam(vendor.id).reduce((sum, sale) => sum + sale.attendees, 0),
    }))
    .filter((row) => row.attendees >= BONUS_100)
    .sort((a, b) => b.attendees - a.attendees);
  return ranked[0]?.id ?? null;
}

export function publicPerson(person: SalesPerson) {
  return {
    id: person.id,
    role: person.role,
    vendorId: person.vendorId,
    name: person.name,
    email: person.email,
    phone: person.phone,
    code: person.code,
    createdAt: person.createdAt,
  };
}

export function dashboardFor(person: SalesPerson) {
  const milestone = currentMilestone();
  const topId = topVendorId();
  if (person.role === 'seller') {
    const attendees = sumAttendees(person.id);
    const commission = sumCommission(person.id);
    const sold = sumAmount(person.id);
    return {
      me: publicPerson(person),
      attendees,
      commissionKobo: commission,
      target: PERSON_TARGET,
      milestone,
      sales: salesForPerson(person.id).map((sale) => ({
        ...sale,
        soldBy: person.name,
      })),
      sellers: [],
      teamAttendees: attendees,
      personalAttendees: attendees,
      personalCommissionKobo: commission,
      personalAmountKobo: sold,
      bonus75: false,
      bonus100: false,
      bonus100Kobo: 0,
      topSeller: false,
      topSellerKobo: 0,
      teamMin: TEAM_MIN,
      teamTarget: TEAM_TARGET,
    };
  }

  const teamSales = salesForVendorTeam(person.id);
  const teamAttendees = teamSales.reduce((sum, sale) => sum + sale.attendees, 0);
  const personalAttendees = sumAttendees(person.id);
  const personalCommission = sumCommission(person.id);
  const sellers = listSellers(person.id).map((seller) => ({
    ...publicPerson(seller),
    attendees: sumAttendees(seller.id),
    amountKobo: sumAmount(seller.id),
    commissionKobo: sumCommission(seller.id),
  }));

  return {
    me: publicPerson(person),
    attendees: teamAttendees,
    commissionKobo: personalCommission,
    target: PERSON_TARGET,
    milestone,
    sales: teamSales.map((sale) => ({
      ...sale,
      soldBy: getPerson(sale.personId)?.name || sale.personId,
    })),
    sellers,
    teamAttendees,
    personalAttendees,
    personalCommissionKobo: personalCommission,
    personalAmountKobo: sumAmount(person.id),
    bonus75: teamAttendees >= BONUS_75,
    bonus100: teamAttendees >= BONUS_100,
    bonus100Kobo: teamAttendees >= BONUS_100 ? BONUS_100_KOBO : 0,
    topSeller: topId === person.id,
    topSellerKobo: topId === person.id ? BONUS_TOP_KOBO : 0,
    teamMin: TEAM_MIN,
    teamTarget: TEAM_TARGET,
  };
}
