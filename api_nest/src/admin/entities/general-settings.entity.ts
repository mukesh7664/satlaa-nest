import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { getFullS3Url } from '../../common/utils/s3-url.util';
import { Store } from '../../stores/entities/store.entity';

@Entity('general_settings')
export class GeneralSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 'Inospire' })
    siteName: string;

    @Column({ type: 'text', nullable: true })
    siteDescription: string;

    @Column({ nullable: true })
    siteLogo: string;

    @Column({ nullable: true })
    siteFavicon: string;

    @AfterLoad()
    populateUrls() {
        // Resolve siteLogo
        if (this.siteLogo && !this.siteLogo.startsWith('http')) {
            try {
                const parsed = typeof this.siteLogo === 'string' && this.siteLogo.startsWith('{') ? JSON.parse(this.siteLogo) : null;
                const key = parsed?.key || this.siteLogo;
                this.siteLogo = getFullS3Url(key);
            } catch (e) {
                this.siteLogo = getFullS3Url(this.siteLogo);
            }
        }
        // Resolve siteFavicon
        if (this.siteFavicon && !this.siteFavicon.startsWith('http')) {
            try {
                const parsed = typeof this.siteFavicon === 'string' && this.siteFavicon.startsWith('{') ? JSON.parse(this.siteFavicon) : null;
                const key = parsed?.key || this.siteFavicon;
                this.siteFavicon = getFullS3Url(key);
            } catch (e) {
                this.siteFavicon = getFullS3Url(this.siteFavicon);
            }
        }
    }

    @Column({ nullable: true })
    contactEmail: string;

    @Column({ nullable: true })
    contactPhone: string;

    @Column({ nullable: true })
    supportEmail: string;

    @Column({ nullable: true })
    supportPhone: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column('jsonb', { nullable: true })
    locations: any[];

    @Column('jsonb', { nullable: true })
    socialLinks: any;

    @Column('jsonb', { nullable: true })
    smsSettings: any;

    @Column('jsonb', { default: [], nullable: true })
    paymentGateways: any[];

    @Column({ default: 'INR', nullable: true })
    defaultCurrency: string;

    @Column('simple-array', { default: 'INR,USD', nullable: true })
    supportedCurrencies: string[];

    @Column({ default: 'en', nullable: true })
    defaultLanguage: string;

    @Column('simple-array', { default: 'en', nullable: true })
    supportedLanguages: string[];

    @Column({ default: 'Asia/Kolkata', nullable: true })
    timezone: string;

    @Column('jsonb', { nullable: true })
    taxSettings: any;

    @Column('jsonb', { default: [], nullable: true })
    businessHours: any[];

    @Column('jsonb', { nullable: true })
    features: any;

    @Column('jsonb', { nullable: true })
    topBar: any;

    @Column('jsonb', { nullable: true })
    popupSettings: any;

    @Column('jsonb', { nullable: true })
    whatsappButton: any;

    @Column('jsonb', { nullable: true })
    currencyConfig: any;

    @Column('jsonb', { nullable: true })
    themeColors: any;

    @Column('jsonb', { nullable: true })
    componentColors: any;

    @Column('jsonb', { nullable: true })
    invoiceSettings: any;

    @Column('jsonb', { nullable: true })
    maintenanceMode: any;

    @Column('jsonb', { nullable: true })
    security: any;

    @Column('jsonb', { nullable: true })
    notificationSettings: any;

    @Column('jsonb', { nullable: true })
    policies: any;

    @Column({ default: false })
    showInMarketplace: boolean;

    @Column({ nullable: true })
    lastUpdatedBy: string;

    // Tenant Relation
    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    storeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
