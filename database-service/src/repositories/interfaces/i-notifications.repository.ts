export interface Notification {
  id: string;
  type: "EMAIL" | "SMS";
  message: string;
  recipients: string[];
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationsRepository {
  create(data: {
    type: "EMAIL" | "SMS";
    message: string;
    recipients: string[];
    sentAt?: Date | null;
  }): Promise<Notification>;

  findById(id: string): Promise<Notification | null>;

  findAll(filter?: Record<string, any>, pagination?: { page: number; pageSize: number }): Promise<Notification[]>;

  update(id: string, data: Partial<Omit<Notification, "id" | "createdAt">>): Promise<Notification>;

  delete(id: string): Promise<void>;
}
