export type NotificationType = "EMAIL" | "SMS";

export interface CreateNotificationDTO {
  type: NotificationType;
  message: string;
  recipients: string[]; // array of emails or phone numbers
}
