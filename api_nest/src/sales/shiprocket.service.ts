import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Shipment } from './entities/shipment.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { Product } from '../catalog/entities/product.entity';
import { ShippingConfig } from './entities/shipping-config.entity';
import { CryptoService } from '../common/crypto.service';
import axios from 'axios';

@Injectable()
export class ShiprocketService {
  private readonly baseUrl = 'https://apiv2.shiprocket.in/v1/external';

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(GeneralSettings)
    private settingsRepository: Repository<GeneralSettings>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ShippingConfig)
    private shippingConfigRepository: Repository<ShippingConfig>,
    private readonly cryptoService: CryptoService,
  ) {}

  private async getShiprocketConfig(storeId: string) {
    const shippingConfig = await this.shippingConfigRepository.findOne({
      where: { storeId, provider: 'shiprocket' }
    });
    
    let config = null;
    if (shippingConfig && shippingConfig.email && shippingConfig.password) {
      config = {
        email: shippingConfig.email,
        password: this.cryptoService.decrypt(shippingConfig.password),
      };
    }

    // Fallback to .env credentials if not configured for this specific store
    if (!config) {
      const globalEmail = process.env.SHIPROCKET_EMAIL;
      const globalPassword = process.env.SHIPROCKET_PASSWORD;

      if (globalEmail && globalPassword) {
        config = { email: globalEmail, password: globalPassword };
      } else {
        throw new BadRequestException('Shiprocket credentials not configured for this store and no global defaults found.');
      }
    }

    return config;
  }

  async getShippingConfig(storeId: string) {
    const config = await this.shippingConfigRepository.findOne({
      where: { storeId, provider: 'shiprocket' }
    });
    
    if (config) {
      return {
        isEnabled: config.isEnabled,
        email: config.email || '',
        password: config.password ? this.cryptoService.decrypt(config.password) : '',
        pickupPincode: config.pickupPincode || '',
      };
    }
    
    return { isEnabled: false, email: '', password: '', pickupPincode: '' };
  }

  async saveShippingConfig(storeId: string, settings: any) {
    let config = await this.shippingConfigRepository.findOne({
      where: { storeId, provider: 'shiprocket' }
    });

    const encryptedPassword = settings.password ? this.cryptoService.encrypt(settings.password) : null;

    if (config) {
      config.isEnabled = settings.isEnabled ?? false;
      config.email = settings.email;
      config.password = encryptedPassword;
      config.pickupPincode = settings.pickupPincode;
      return await this.shippingConfigRepository.save(config);
    }

    const newConfig = this.shippingConfigRepository.create({
      storeId,
      provider: 'shiprocket',
      isEnabled: settings.isEnabled ?? false,
      email: settings.email,
      password: encryptedPassword,
      pickupPincode: settings.pickupPincode,
    });
    return await this.shippingConfigRepository.save(newConfig);
  }

  private async login(storeId: string): Promise<string> {
    const config = await this.getShiprocketConfig(storeId);

    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: config.email,
        password: config.password,
      });

      return response.data.token;
    } catch (error) {
      console.error('Shiprocket Login Error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to authenticate with Shiprocket.');
    }
  }

  async testCredentials(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email,
        password,
      });

      if (response.data && response.data.token) {
        return { success: true, message: 'Authentication successful with Shiprocket' };
      }
      return { success: false, message: 'Authentication failed: No token returned' };
    } catch (error) {
      console.error('Shiprocket Validation Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to authenticate with Shiprocket.';
      return { success: false, message: errorMessage };
    }
  }

  async getPickupLocations(storeId: string) {
    const token = await this.login(storeId);

    try {
      const response = await axios.get(`${this.baseUrl}/settings/company/pickup`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Shiprocket Pickup Locations Error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to fetch pickup locations from Shiprocket.');
    }
  }

  async addPickupLocation(storeId: string, details: any) {
    const token = await this.login(storeId);

    try {
      const response = await axios.post(`${this.baseUrl}/settings/company/addpickup`, details, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      return response.data;
    } catch (error) {
      console.error('Shiprocket Add Pickup Location Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || 'Failed to add pickup location in Shiprocket'
      );
    }
  }

  async getSuggestions(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) throw new BadRequestException('Order not found');

    let totalWeight = 0;
    for (const item of order.items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      const weight = product?.product_details?.weight || product?.attributes?.weight || 0.5;
      totalWeight += Number(weight) * item.quantity;
    }

    return {
      weight: totalWeight || 0.5,
      dimensions: { length: 10, breadth: 10, height: 10 },
      paymentMode: order.paymentMethod?.toLowerCase() === 'cod' ? 'COD' : 'Prepaid',
    };
  }

  async createOrder(orderId: string, details: any) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'items', 'shipment'],
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.shipment) throw new BadRequestException('Shipment already exists for this order');

    const token = await this.login(order.storeId);

    const shippingAddress = (order.shippingAddress as any) || {};
    const customer = (order.customer as any) || {};

    const billing_pincode = shippingAddress.pinCode || shippingAddress.pincode || shippingAddress.zip || shippingAddress.zipCode || customer.pincode || customer.zip || '';

    if (!billing_pincode) {
      throw new BadRequestException('Billing pincode is required for Shiprocket shipment.');
    }

    const payload = {
      order_id: order.orderNumber,
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: details.pickupLocation || 'Primary',
      billing_customer_name: shippingAddress.fullName || customer.firstName || 'Guest',
      billing_last_name: customer.lastName || '',
      billing_address: shippingAddress.streetAddress || shippingAddress.address || 'Address not provided',
      billing_address_2: shippingAddress.apartment || shippingAddress.address2 || '',
      billing_city: shippingAddress.city || '',
      billing_pincode: billing_pincode,
      billing_state: shippingAddress.state || '',
      billing_country: shippingAddress.country || 'India',
      billing_email: customer.email || shippingAddress.email || '',
      billing_phone: shippingAddress.phone || customer.phone || '',
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName,
        sku: item.sku || item.productId,
        units: item.quantity,
        selling_price: item.price,
        hsn: item.hsn_code,
      })),
      payment_method: details.paymentMode || (order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'),
      sub_total: order.totalAmount,
      length: details.length || 10,
      breadth: details.breadth || details.width || 10,
      height: details.height || 10,
      weight: details.weight || 0.5,
    };

    try {
      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      const shipment = this.shipmentRepository.create({
        orderId: order.id,
        shiprocketOrderId: data.order_id,
        shipmentId: data.shipment_id,
        status: 'CREATED',
      });

      return await this.shipmentRepository.save(shipment);
    } catch (error) {
      console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || 'Failed to create order in Shiprocket'
      );
    }
  }

  async generateLabel(storeId: string, shipmentId: string) {
    const token = await this.login(storeId);

    try {
      const response = await axios.post(`${this.baseUrl}/courier/generate/label`, {
        shipment_id: [shipmentId],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Shiprocket Label Generation Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || 'Failed to generate label from Shiprocket'
      );
    }
  }

  async getServiceability(storeId: string, shiprocketOrderId: string) {
    const token = await this.login(storeId);

    try {
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        params: { order_id: shiprocketOrderId },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    } catch (error) {
      console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || 'Failed to fetch courier serviceability'
      );
    }
  }

  async checkServiceability(storeId: string, delivery_pincode: string, productId?: string) {
    const token = await this.login(storeId);
    
    // Attempt to get pickup pincode from shipping config
    const shippingConfig = await this.shippingConfigRepository.findOne({
      where: { storeId, provider: 'shiprocket' }
    });
    const settings = await this.settingsRepository.findOne({ where: { storeId } });
    const pickupPincode = shippingConfig?.pickupPincode || settings?.address?.match(/\d{6}/)?.[0] || '110001';
    
    // Get product weight if productId is provided
    let weight = 0.5;
    if (productId) {
      const product = await this.productRepository.findOne({ where: { id: productId } });
      weight = product?.product_details?.weight || product?.attributes?.weight || 0.5;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: delivery_pincode,
          weight: weight,
          cod: 1, // Default to check both
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      if (data.status !== 200 || !data.data?.available_courier_companies?.length) {
        return {
          serviceable: false,
          message: 'Not serviceable to this pincode',
        };
      }

      // Get the best (fastest) courier
      const couriers = data.data.available_courier_companies;
      const bestCourier = couriers.sort((a: any, b: any) => 
        (a.etd_hours || 999) - (b.etd_hours || 999)
      )[0];

      return {
        serviceable: true,
        estimated_delivery_date: bestCourier.etd,
        etd_hours: bestCourier.etd_hours,
        courier_name: bestCourier.courier_name,
        message: `Estimated delivery by ${bestCourier.etd}`,
      };
    } catch (error) {
      // If Shiprocket fails or is not configured properly, provide a fallback
      console.warn('Shiprocket Check Serviceability Failed, using fallback:', error.message);
      
      // Basic validation for Indian 6-digit PIN
      if (/^\d{6}$/.test(delivery_pincode)) {
        const date = new Date();
        date.setDate(date.getDate() + 4); // Default 4 days
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return {
          serviceable: true,
          estimated_delivery_date: date.toLocaleDateString('en-IN', options),
          message: `Expected delivery in 3-5 days`,
          fallback: true
        };
      }

      return {
        serviceable: false,
        message: 'Unable to verify serviceability for this pincode',
      };
    }
  }

  async assignAwb(storeId: string, shipmentId: string, courierId?: number) {
    const token = await this.login(storeId);

    try {
      const payload: any = {
        shipment_id: shipmentId,
      };
      if (courierId) {
        payload.courier_id = courierId;
      }

      const response = await axios.post(`${this.baseUrl}/courier/assign/awb/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      const shipment = await this.shipmentRepository.findOne({ 
        where: { shipmentId: String(shipmentId) },
        relations: ['order'],
      });

      if (shipment && data.status === 200) {
        const awbData = data.response.data;
        shipment.awbCode = awbData.awb_code;
        shipment.courierName = awbData.courier_name;
        shipment.status = 'READY_TO_SHIP';
        await this.shipmentRepository.save(shipment);

        if (shipment.order) {
          shipment.order.status = OrderStatus.READY_TO_SHIP;
          await this.orderRepository.save(shipment.order);
        }
      }

      return data;
    } catch (error) {
      console.error('Shiprocket AWB Assignment Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.message || 'Failed to assign AWB from Shiprocket'
      );
    }
  }

  async handleWebhook(payload: any) {
    const { order_id, shipment_id, awb, status_code } = payload;

    const shipment = await this.shipmentRepository.findOne({
      where: [{ shiprocketOrderId: String(order_id) }, { shipmentId: String(shipment_id) }],
      relations: ['order'],
    });

    if (!shipment) {
      console.warn(`Shiprocket Webhook Error: No shipment found with Shiprocket Order ID ${order_id} or Shipment ID ${shipment_id}`);
      return { success: false, message: 'Shipment not found' };
    }

    // Update AWB if provided
    if (awb && !shipment.awbCode) {
      shipment.awbCode = awb;
    }

    // Status Mapping: 
    // 1: AWB Assigned, 6: Shipped, 17: Out for Delivery, 7/11: Delivered, 4: Cancelled, 13: Returned
    const shiprocketStatusMap: Record<number, OrderStatus> = {
      1: OrderStatus.READY_TO_SHIP,
      6: OrderStatus.SHIPPED,
      17: OrderStatus.OUT_FOR_DELIVERY,
      7: OrderStatus.DELIVERED,
      11: OrderStatus.DELIVERED,
      4: OrderStatus.CANCELLED,
      13: OrderStatus.RETURNED,
    };

    const newStatus = shiprocketStatusMap[status_code];

    if (newStatus) {
      shipment.status = payload.current_status || String(status_code);
      await this.shipmentRepository.save(shipment);

      if (shipment.order) {
        shipment.order.status = newStatus;
        await this.orderRepository.save(shipment.order);
      }
    }

    return { success: true };
  }
}
