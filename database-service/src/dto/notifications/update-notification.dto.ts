export interface UpdateNotificationDTO {
  message?: string;
  recipients?: string[];
  sentAt?: string | null;
}
