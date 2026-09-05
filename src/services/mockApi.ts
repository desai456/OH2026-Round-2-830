import { Quote, Product, Customer, Warehouse, Invoice } from '../types';
import { INITIAL_QUOTES, PRODUCTS, CUSTOMERS, WAREHOUSES, INITIAL_INVOICES } from '../data/mockData';

class DealFlowApiService {
  private delayMs = 150;

  private async delay() {
    return new Promise(res => setTimeout(res, this.delayMs));
  }

  async getQuotes(): Promise<Quote[]> {
    await this.delay();
    return INITIAL_QUOTES;
  }

  async getQuoteById(id: string): Promise<Quote | undefined> {
    await this.delay();
    return INITIAL_QUOTES.find(q => q.id === id || q.quoteNumber === id);
  }

  async getProducts(): Promise<Product[]> {
    await this.delay();
    return PRODUCTS;
  }

  async getCustomers(): Promise<Customer[]> {
    await this.delay();
    return CUSTOMERS;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    await this.delay();
    return WAREHOUSES;
  }

  async getInvoices(): Promise<Invoice[]> {
    await this.delay();
    return INITIAL_INVOICES;
  }
}

export const mockApi = new DealFlowApiService();
