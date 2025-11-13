/**
 * Hexagonal Architecture — Ports (Repository Interfaces)
 *
 * These interfaces define the required persistence operations for:
 *  - Routes
 *  - Baseline management
 *  - Banking (Article 20)
 *  - Pooling (Article 21)
 *
 * The application layer depends ONLY on these interfaces.
 * Adapters (Postgres, in-memory, mock) implement them.
 */

import { Route } from '../domain/entities';

export interface IRouteRepository {
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route | null>;
  getRouteByRouteId(routeId: string): Promise<Route | null>;
  getBaseline(): Promise<Route | null>;
  setBaseline(id: number): Promise<void>;
}

export type BankEntry = {
  id: number;
  shipId: string;
  year: number;
  amountT: number; // tonnes CO2e
  createdAt: string;
};

export interface IBankingRepository {
  insertBankEntry(shipId: string, year: number, amountT: number): Promise<BankEntry>;
  getBankEntries(shipId?: string, year?: number): Promise<BankEntry[]>;
  getAvailableBank(shipId: string, year: number): Promise<number>;
}

export interface IPoolingRepository {
  /**
   * Persist a pool record and its members.
   * pool = {
   *   year: number,
   *   members: [{
   *      shipId,
   *      cbBefore,
   *      cbAfter
   *   }]
   * }
   */
  createPoolRecord(
    year: number,
    members: { shipId: string; cbBefore: number; cbAfter: number }[]
  ): Promise<{ poolId: number; year: number }>;
}

/**
 * Combined interface that an adapter (e.g., Postgres) can implement.
 * You can inject this aggregated repository into your use-cases.
 */
export interface IRepository
  extends IRouteRepository,
    IBankingRepository,
    IPoolingRepository {}
