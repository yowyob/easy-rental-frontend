// FILE: packages/shared-services/src/api/index.ts
export { ApiClient, createApiClient, configureApiBaseUrl } from './api-client';
export type { ApiConfig, ApiResponse, ApiError } from './api-client';

export { authService } from './auth.service';
export { orgService } from './org.service';
export type { SubscriptionPaymentMethod } from './org.service';
export { agencyService } from './agency.service';
export {
  formatGeofenceRadius,
  normalizeAgency,
  normalizeAgencyList,
  buildAgencyFormInitialData,
  resolveAgencyContact,
} from './agency.mapper';
export { staffService } from './staff.service';
export { vehicleService } from './vehicle.service';
export { buildVehicleFormInitialData } from './vehicle.mapper';
export { DEFAULT_VEHICLE_FUNCTIONALITIES } from './vehicle.mapper';
export { driverService } from './driver.service';
export { formatScheduleDate } from './driver.mapper';
export { notifService } from './notif.service';
export { formatNotificationDate, formatNotificationReason, isNotificationRead, normalizeNotificationList } from './notif.mapper';
export { dispatchNotificationsRefresh, NOTIFICATIONS_REFRESH_EVENT } from './notification-events';
export type { NotificationRefreshContext } from './notification-events';
export { extraService } from './extra.service';
export type { CreatePlanPayload } from './extra.service';
export type { NormalizedSubscriptionPlan } from './subscription.mapper';
export { adminService } from './admin.service';
export { supportService } from './support.service';
export type { SupportConfig, SupportConversation, SupportMessage } from './support.service';
export {
  getOrCreateSupportSessionId,
  resolveSupportVisitorContext,
} from './support-visitor';
export type { SupportVisitorContext } from './support-visitor';
export { rentalService } from './rental.service';
export { inspectionService, DEFAULT_INSPECTION_ITEMS, INSPECTION_ITEM_LABELS, ITEM_STATUS_LABELS } from './inspection.service';
export type { Inspection, InspectionItem, InspectionComparison, ItemDiff } from './inspection.service';
export { loyaltyService } from './loyalty.service';
export type { LoyaltyBalance, LoyaltyEntry } from './loyalty.service';
export { trackingService } from './tracking.service';
export type { Position, TrackingSummary } from './tracking.service';
export { ratingService } from './rating.service';
export type { Rating, RatingStats } from './rating.service';
export { statsService } from './stats.service';
export { statisticsService } from './statistics.service';
export type { PlatformStats } from './statistics.service';
export { auditService } from './audit.service';
export type { AuditEvent, AuditEventFilters } from './audit.service';
export { transactionService } from './transaction.service';
export { reviewService } from './review.service';
export type { ReviewItem, ReviewModerationStats, PlatformFeedbackPayload } from './review.service';
export { conversationService } from './conversation.service';
export type { Conversation, ChatMessage } from './conversation.service';
export {
  clearAuthSession,
  decodeJwtPayload,
  dismissFeedbackPrompt,
  getStoredToken,
  hasCompletedFirstUsage,
  hasDismissedFeedbackPrompt,
  IDLE_TIMEOUT_MS,
  initAuthSessionWatcher,
  isTokenExpired,
  markFirstUsageDone,
  persistAuthToken,
  setAuthRefreshHandler,
  touchAuthActivity,
} from '../auth/auth-session';
export { isOrganizationOnboarded, normalizeOrganization } from './org.mapper';
export { resolveMediaDisplayUrl, extractUploadedMediaUrl, canonicalMediaStoragePath } from './media.mapper';
export {
  filterCatalogVehicles,
  filterCatalogAgencies,
  formatXaf,
  vehicleStatusLabel,
  rentalPeriodOverlapsSchedule,
} from './catalog.filters';