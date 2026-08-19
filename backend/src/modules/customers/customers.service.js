import repository from "./customers.repository.js";

class CustomerService {

  async createCustomer(data) {

    const phone = await repository.findByPhone(data.phone);

    if (phone) {
      throw new Error("Phone number already exists");
    }

    if (data.email) {

      const email = await repository.findByEmail(data.email);

      if (email) {
        throw new Error("Email already exists");
      }

    }

    return repository.create(data);
  }

  async getCustomers() {
    return repository.findAll();
  }

  async getCustomer(id) {

    const customer = await repository.findById(id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  }

  async updateCustomer(id, data) {

    await this.getCustomer(id);

    return repository.update(id, data);
  }

  async deleteCustomer(id) {

    await this.getCustomer(id);

    return repository.delete(id);
  }
}

export default new CustomerService();